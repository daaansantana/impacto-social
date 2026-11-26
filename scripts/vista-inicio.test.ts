import { describe, expect, it } from "vitest";
import {
  CONTEXTO_EXEMPLO,
  FIM_DE_ANO_EXEMPLO,
  IMPACTO_EXEMPLO,
  PROJETOS_EXEMPLO,
} from "@/lib/exemplo-inicio";
import {
  alcance,
  construirInicio,
  corIIS,
  FAIXAS_MAPA,
  fraseAlcance,
} from "@/lib/vista-inicio";

// Os valores esperados foram feitos à mão a partir dos dados de exemplo.
const texto = (s: string) => s.replace(/\s/g, " ");
const vista = construirInicio(
  IMPACTO_EXEMPLO,
  PROJETOS_EXEMPLO,
  CONTEXTO_EXEMPLO,
  FIM_DE_ANO_EXEMPLO,
);

describe("alcance", () => {
  it("soma os beneficiários por mês e a parte com a necessidade acima do percentil 50", () => {
    const a = alcance(IMPACTO_EXEMPLO);
    expect(a.beneficiariosPorMes).toBe(713);
    // 439 de 713 (P02, P05, P06, P07, P08, P10, P11, P12)
    expect(a.percentagemNecessidadeAlta).toBeCloseTo((439 / 713) * 100, 10);
  });

  it("sem ações, 0 e 0", () => {
    expect(alcance([])).toEqual({
      beneficiariosPorMes: 0,
      percentagemNecessidadeAlta: 0,
    });
  });
});

describe("fraseAlcance", () => {
  it("diz quantos em cada 10", () => {
    expect(fraseAlcance(61.57)).toBe(
      "6 em cada 10 estão onde a necessidade é alta.",
    );
    expect(fraseAlcance(3)).toBe(
      "Quase ninguém está onde a necessidade é alta.",
    );
    expect(fraseAlcance(97)).toBe(
      "Quase todos estão onde a necessidade é alta.",
    );
  });
});

describe("corIIS", () => {
  it("um só azul: escuro a partir de 60, médio a partir de 40, claro abaixo", () => {
    expect(corIIS(60)).toBe(FAIXAS_MAPA[0].cor);
    expect(corIIS(59.9)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(40)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(39.9)).toBe(FAIXAS_MAPA[2].cor);
  });
});

describe("construirInicio", () => {
  it("o alcance em grande, com a frase", () => {
    expect(vista?.alcance.beneficiarios).toBe("713");
    expect(texto(vista?.alcance.percentagem ?? "")).toBe("62%");
    expect(vista?.alcance.frase).toBe(
      "6 em cada 10 estão onde a necessidade é alta.",
    );
  });

  it("3 leituras: o maior IIS (P10, 93), o primeiro ponto a confirmar (P03) e o fim de ano", () => {
    const [mais, confirmar, fim] = vista?.leituras ?? [];
    expect(mais.texto).toBe(
      "A Ação de exemplo 10 (Filipinas, logística) tem o maior IIS: 93 em 100.",
    );
    expect(mais.ligacao.href).toBe("/acoes/P10");
    expect(mais.noMapa).toBe("P10");
    expect(confirmar.ligacao.href).toBe("/acoes/P03");
    expect(confirmar.noMapa).toBe("P03");
    expect(fim.ligacao.href).toBe("/como-medimos");
    expect(fim.noMapa).toBeUndefined();
    expect(texto(fim.texto)).toContain("sobem 38% e a despesa só 2%");
  });

  it("12 pontos no mapa, com as capitais e a cor do IIS", () => {
    expect(vista?.pontos).toHaveLength(12);
    const p10 = vista?.pontos.find((p) => p.id === "P10");
    expect(p10).toMatchObject({
      latitude: 14.5515,
      longitude: 121.035,
      iis: 93,
    });
    expect(p10?.cor).toBe(FAIXAS_MAPA[0].cor);
    expect(vista?.pontos.find((p) => p.id === "P09")?.cor).toBe(
      FAIXAS_MAPA[2].cor,
    );
  });

  it("até 3 a confirmar: mais pontos primeiro e, num empate, o menor IIS", () => {
    expect(vista?.aConfirmar.map((i) => i.projeto)).toEqual([
      "P03",
      "P01",
      "P06",
    ]);
    expect(vista?.aConfirmar[0].mais).toBe("E mais 1 ponto.");
    expect(vista?.aConfirmar[2].mais).toBeNull();
    expect(vista?.aConfirmar[0].texto.charAt(0)).toBe("C");
  });

  it("sem ações, não há vista (o ecrã mostra o estado vazio)", () => {
    expect(
      construirInicio(
        [],
        PROJETOS_EXEMPLO,
        CONTEXTO_EXEMPLO,
        FIM_DE_ANO_EXEMPLO,
      ),
    ).toBeNull();
  });
});
