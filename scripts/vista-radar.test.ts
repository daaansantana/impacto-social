import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { juntarAcoes } from "@/lib/acoes";
import {
  type EntradaNovoProjeto,
  medianaEvidencia,
  novoProjeto,
  quadrante,
} from "@/lib/radar";
import {
  areasDoRadar,
  COR_SEM_DADO,
  construirRadar,
  corNecessidade,
  FAIXAS_NECESSIDADE,
  tamanhoEvidencia,
  vistaNovoProjeto,
} from "@/lib/vista-radar";
import type { Contexto, ImpactoAcao, Projeto, RadarCelula } from "@/types";

// Os dados reais: radar.json e as funções do Dan (lib/radar.ts).
const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const celulas = ler<RadarCelula[]>("public/data/radar.json");
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const contexto = ler<Contexto[]>("public/data/contexto.json");
const acoes = juntarAcoes(impacto, projetos, contexto);
const limite = medianaEvidencia(impacto);
const radar = (area: string) =>
  construirRadar(celulas, contexto, area, limite, quadrante);

describe("o radar.json", () => {
  it("12 países por 6 áreas", () => {
    expect(celulas).toHaveLength(72);
    const areas = areasDoRadar(celulas);
    expect(areas).toHaveLength(6);
    for (const a of areas)
      expect(celulas.filter((c) => c.area === a)).toHaveLength(12);
  });
});

describe("construirRadar", () => {
  it("12 marcadores; a cor é a necessidade e o tamanho a evidência", () => {
    const v = radar("educacao");
    expect(v.pontos).toHaveLength(12);
    const senegal = celulas.find(
      (c) => c.area === "educacao" && c.pais === "Senegal",
    );
    const p = v.pontos.find((x) => x.id === "Senegal");
    expect(p?.cor).toBe(corNecessidade(senegal?.necessidadePercentil ?? null));
    expect(p?.tamanho).toBe(tamanhoEvidencia(senegal?.evidencia ?? 0));
  });

  it("sem o indicador (Gana e Moçambique em educação): cinzento, «Sem dado» e fora do quadrante", () => {
    const v = radar("educacao");
    for (const pais of ["Ghana", "Mocambique"]) {
      const p = v.pontos.find((x) => x.id === pais);
      expect(p?.cor).toBe(COR_SEM_DADO);
      expect(p?.linhas?.[0]).toBe("Necessidade: Sem dado");
    }
    expect(v.quadrante.semDado.sort()).toEqual(["Gana", "Moçambique"]);
    expect(v.quadrante.pontos).toHaveLength(10);
  });

  it("os pontos com ação não são estimados; os outros sim", () => {
    const v = radar("educacao");
    expect(
      v.quadrante.pontos
        .filter((p) => !p.estimado)
        .map((p) => p.pais)
        .sort(),
    ).toEqual(["Brasil", "Filipinas", "Senegal"]);
    expect(v.quadrante.pontos.find((p) => p.pais === "Quénia")?.estimado).toBe(
      true,
    );
  });

  it("o limite da evidência alta é a mediana das 12 ações", () => {
    expect(radar("educacao").quadrante.limite).toBeCloseTo(55.83, 2);
  });

  it("mudar a área muda o mapa, o quadrante e a lista", () => {
    const a = radar("educacao");
    const b = radar("logistica");
    expect(a.pontos.map((p) => p.cor)).not.toEqual(b.pontos.map((p) => p.cor));
    expect(a.quadrante.pontos).not.toEqual(b.quadrante.pontos);
    expect(a.lista).not.toEqual(b.lista);
    expect(b.lista.find((l) => l.pais === "Uganda")).toMatchObject({
      estimado: false,
      leitura: "Reforçar",
    });
  });

  it("«Onde faria mais diferença»: Reforçar primeiro, sem dado no fim", () => {
    const v = radar("educacao");
    expect(v.lista).toHaveLength(12);
    const ordem = [
      "Reforçar",
      "Repensar ou apoiar",
      "Manter",
      "Reavaliar",
      null,
    ];
    const posicoes = v.lista.map((l) => ordem.indexOf(l.quadrante));
    expect(posicoes).toEqual([...posicoes].sort((x, y) => x - y));
    expect(v.lista[0]).toMatchObject({ pais: "Senegal", leitura: "Reforçar" });
    expect(v.lista.slice(-2).map((l) => l.leitura)).toEqual([
      "Sem dado da necessidade",
      "Sem dado da necessidade",
    ]);
  });

  it("a legenda da necessidade cobre 0 a 100", () => {
    expect(corNecessidade(0)).toBe(FAIXAS_NECESSIDADE[0].cor);
    expect(corNecessidade(100)).toBe(FAIXAS_NECESSIDADE[3].cor);
  });
});

describe("novo projeto (novoProjeto do Dan)", () => {
  const ver = (pais: string, area: string, orcamento = 240000) => {
    const entrada: EntradaNovoProjeto = {
      pais,
      area,
      formato: "oficinas",
      orcamento,
    };
    return vistaNovoProjeto(
      novoProjeto(entrada, { acoes, contexto, celulas }),
      celulas.find((c) => c.pais === pais && c.area === area),
      (projeto) => acoes.find((a) => a.projeto === projeto)?.confianca,
    );
  };

  it("Uganda, logística (já tem o P11, em Reforçar): avançar, com a confiança da ação", () => {
    const v = ver("Uganda", "logistica");
    expect(v?.leitura).toBe("Avançar");
    expect(v?.confianca).toBe("Alta: a ação que já existe (P11)");
    // 240 000 € ÷ o custo por pessoa do P11
    const p11 = acoes.find((a) => a.projeto === "P11");
    expect(v?.alcance).toBe(
      `Cerca de ${Math.round(240000 / (p11?.custoPorPessoa.valor ?? 1))} beneficiários`,
    );
  });

  it("cada quadrante dá a sua leitura; sem o indicador, confirmar a necessidade", () => {
    expect(ver("Quenia", "educacao")?.leitura).toBe("Pilotar");
    expect(ver("Brasil", "educacao")?.leitura).toBe("Rever o desenho");
    expect(ver("Peru", "educacao")?.leitura).toBe("Rever o desenho");
    const gana = ver("Ghana", "educacao");
    expect(gana?.leitura).toBe("Confirmar a necessidade");
    expect(gana?.necessidade).toBe("Sem dado");
  });

  it("onde não há ação, a confiança é estimada a partir das ações da área", () => {
    expect(ver("Quenia", "educacao")?.confianca).toBe(
      "Média: estimada a partir de 3 ações noutros países",
    );
  });
});
