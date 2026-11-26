import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  AREAS_RADAR,
  classificarExemplo,
  LIMITE_EVIDENCIA_EXEMPLO,
  novoProjetoExemplo,
  quadranteExemplo,
  RADAR_EXEMPLO,
} from "@/lib/exemplo-radar";
import {
  COR_SEM_DADO,
  construirRadar,
  corNecessidade,
  FAIXAS_NECESSIDADE,
  tamanhoEvidencia,
  vistaNovoProjeto,
} from "@/lib/vista-radar";
import type { Contexto } from "@/types";

const contexto = JSON.parse(
  readFileSync("public/data/contexto.json", "utf-8"),
) as Contexto[];
const radar = (area: string) =>
  construirRadar(
    RADAR_EXEMPLO,
    contexto,
    area,
    LIMITE_EVIDENCIA_EXEMPLO,
    quadranteExemplo,
  );

describe("dados de exemplo do Radar", () => {
  it("12 países por 6 áreas", () => {
    expect(RADAR_EXEMPLO).toHaveLength(72);
    for (const a of AREAS_RADAR)
      expect(RADAR_EXEMPLO.filter((c) => c.area === a)).toHaveLength(12);
  });

  it("onde não há ação, a evidência é estimada a partir da mesma área noutros países", () => {
    const educacao = RADAR_EXEMPLO.filter((c) => c.area === "educacao");
    expect(
      educacao
        .filter((c) => !c.estimado)
        .map((c) => c.pais)
        .sort(),
    ).toEqual(["Brasil", "Filipinas", "Senegal"]);
    const estimadas = educacao.filter((c) => c.estimado);
    expect(new Set(estimadas.map((c) => c.evidencia)).size).toBe(1);
    expect(estimadas[0].n).toBe(3);
  });

  it("o quadrante segue as regras: necessidade acima de 50, evidência acima da mediana", () => {
    expect(classificarExemplo(70, 60, 56.5)).toBe("Reforçar");
    expect(classificarExemplo(70, 50, 56.5)).toBe("Repensar ou apoiar");
    expect(classificarExemplo(30, 60, 56.5)).toBe("Manter");
    expect(classificarExemplo(30, 50, 56.5)).toBe("Reavaliar");
    expect(classificarExemplo(null, 60, 56.5)).toBeNull();
  });
});

describe("construirRadar", () => {
  it("12 marcadores; a cor é a necessidade e o tamanho a evidência", () => {
    const v = radar("saude");
    expect(v.pontos).toHaveLength(12);
    const india = RADAR_EXEMPLO.find(
      (c) => c.area === "saude" && c.pais === "India",
    );
    const p = v.pontos.find((x) => x.id === "India");
    expect(p?.cor).toBe(corNecessidade(india?.necessidadePercentil ?? null));
    expect(p?.tamanho).toBe(tamanhoEvidencia(india?.evidencia ?? 0));
  });

  it("sem o indicador: cor cinzenta, «Sem dado» no popup e fora do quadrante", () => {
    const v = radar("educacao");
    const portugal = v.pontos.find((x) => x.id === "Portugal");
    expect(portugal?.cor).toBe(COR_SEM_DADO);
    expect(portugal?.linhas?.[0]).toBe("Necessidade: Sem dado");
    expect(v.quadrante.pontos.map((p) => p.pais)).not.toContain("Portugal");
    expect(v.quadrante.semDado).toEqual(["Portugal"]);
    expect(v.quadrante.pontos).toHaveLength(11);
  });

  it("os pontos estimados vêm marcados", () => {
    const v = radar("educacao");
    const marcados = v.quadrante.pontos
      .filter((p) => p.estimado)
      .map((p) => p.pais);
    expect(marcados).not.toContain("Brasil");
    expect(marcados).toContain("Quénia");
  });

  it("mudar a área muda o mapa, o quadrante e a lista", () => {
    const a = radar("educacao");
    const b = radar("logistica");
    expect(a.pontos.map((p) => p.cor)).not.toEqual(b.pontos.map((p) => p.cor));
    expect(a.quadrante.pontos).not.toEqual(b.quadrante.pontos);
    expect(a.lista).not.toEqual(b.lista);
    expect(b.lista.find((l) => l.pais === "Uganda")?.estimado).toBe(false);
  });

  it("«Onde faria mais diferença»: só a área escolhida, Reforçar primeiro, sem dado no fim", () => {
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
    expect(v.lista.at(-1)).toMatchObject({
      pais: "Portugal",
      leitura: "Sem dado da necessidade",
    });
  });

  it("a legenda da necessidade cobre 0 a 100", () => {
    expect(corNecessidade(0)).toBe(FAIXAS_NECESSIDADE[0].cor);
    expect(corNecessidade(100)).toBe(FAIXAS_NECESSIDADE[3].cor);
  });
});

describe("novo projeto (exemplo)", () => {
  const celula = (pais: string, area: string) =>
    RADAR_EXEMPLO.find((c) => c.pais === pais && c.area === area);

  it("alcance, necessidade, confiança e leitura", () => {
    const entrada = {
      pais: "Quenia",
      area: "educacao",
      formato: "oficinas",
      orcamento: 240000,
    };
    const v = vistaNovoProjeto(
      novoProjetoExemplo(entrada, { celulas: RADAR_EXEMPLO }),
      celula("Quenia", "educacao"),
    );
    expect(v?.alcance).toBe("Cerca de 100 beneficiários");
    expect(v?.confianca).toContain("estimada a partir de 3 ações");
    expect([
      "Avançar",
      "Pilotar",
      "Rever o desenho",
      "Confirmar a necessidade",
    ]).toContain(v?.leitura);
  });

  it("cada quadrante dá a sua leitura; sem necessidade, confirmar", () => {
    const leitura = (pais: string, area: string) =>
      vistaNovoProjeto(
        novoProjetoExemplo(
          { pais, area, formato: "x", orcamento: 100000 },
          { celulas: RADAR_EXEMPLO },
        ),
        celula(pais, area),
      )?.leitura;
    const esperado = {
      Reforçar: "Avançar",
      "Repensar ou apoiar": "Pilotar",
      Manter: "Rever o desenho",
      Reavaliar: "Rever o desenho",
    } as const;
    for (const c of RADAR_EXEMPLO.filter((x) => x.quadrante && x.n > 1))
      expect(leitura(c.pais, c.area)).toBe(
        esperado[c.quadrante as keyof typeof esperado],
      );
    expect(leitura("Portugal", "educacao")).toBe("Confirmar a necessidade");
  });
});
