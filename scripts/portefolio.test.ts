import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { construirPortefolio } from "@/lib/portefolio";
import type { Mes, Projeto } from "@/types";

const meses = JSON.parse(
  readFileSync("public/data/mensal.json", "utf-8"),
) as Mes[];
const projetos = JSON.parse(
  readFileSync("public/data/projetos.json", "utf-8"),
) as Projeto[];
// Intl põe um espaço sem quebra antes do € e entre os milhares
const texto = (s: string) => s.replace(/ /g, " ");

describe("construirPortefolio", () => {
  it("por euro, em meses comparáveis", () => {
    const v = construirPortefolio(meses, projetos, "euro", true);
    expect(texto(v.conclusao)).toBe(
      "Um beneficiário custa 1457 € no Projeto 07 e 4546 € no Projeto 01: 3,1 vezes mais.",
    );
    expect(v.periodo).toBe("Meses comparáveis (jan–out)");
    expect(v.linhas.filter((l) => l.nomeNoGrafico).map((l) => l.id)).toEqual([
      "P07",
      "P11",
      "P10",
      "P06",
      "P01",
    ]);
    expect(v.linhas[0]).toMatchObject({
      id: "P07",
      posicao: 1,
      onde: "Senegal, educação",
    });
    expect(texto(v.linhas[0].valorTexto)).toBe("1457 € por beneficiário");
    expect(texto(v.linhas[0].alcanceTexto)).toBe("571 beneficiários");
    expect(texto(v.totaisTexto.custo)).toBe("2450,89 €");
    expect(texto(v.totaisTexto.despesa)).toBe("34,86 M€");
    expect(v.avisoFimDeAno).toBe(
      "Em novembro e dezembro, as atividades sobem 56% e os beneficiários 64%, sem mais despesa. Com o interruptor ligado, esses meses ficam de fora.",
    );
    expect(texto(v.grafico.resumo)).toBe(
      "Cada projeto pelo alcance e pela eficiência. Chega a mais gente o Projeto 01, com 2996 beneficiários. É o mais eficiente o Projeto 07, com 1457 € por beneficiário. Os valores de todos estão no ranking.",
    );
  });

  it("por hora, com todos os meses", () => {
    const v = construirPortefolio(meses, projetos, "hora", false);
    expect(texto(v.conclusao)).toBe(
      "Por cada 1000 horas de voluntariado, o Projeto 08 chega a 37 beneficiários e o Projeto 01 a 22.",
    );
    expect(v.periodo).toBe("Todos os meses (com novembro e dezembro)");
  });

  it("por jovem formado", () => {
    const v = construirPortefolio(meses, projetos, "jovem", true);
    expect(texto(v.conclusao)).toBe(
      "Formar um jovem custa 564 € no Projeto 11 e 13 346 € no Projeto 01: 23,7 vezes mais.",
    );
  });

  it("a posição por alcance, como nos gabaritos", () => {
    const G = JSON.parse(readFileSync("scripts/gabaritos.json", "utf-8")) as {
      eficiencia: Record<
        string,
        { alcance: { posicao: Record<string, number> } }
      >;
    };
    for (const [modo, comparaveis] of [
      ["todos", false],
      ["comparaveis", true],
    ] as const) {
      const v = construirPortefolio(meses, projetos, "euro", comparaveis);
      expect(
        Object.fromEntries(v.linhas.map((l) => [l.id, l.posicaoAlcance])),
      ).toEqual(G.eficiencia[modo].alcance.posicao);
    }
    const p07 = construirPortefolio(meses, projetos, "euro", true).linhas[0];
    expect(p07.posicaoAlcanceTexto).toBe("10.º em alcance");
  });

  it("o aviso das horas de 2025 só na unidade por hora", () => {
    const aviso =
      "As horas de voluntariado de 2025 parecem incompletas (−85% face a 2024).";
    expect(construirPortefolio(meses, projetos, "hora", true).avisoHoras).toBe(
      aviso,
    );
    expect(construirPortefolio(meses, projetos, "hora", false).avisoHoras).toBe(
      aviso,
    );
    expect(
      construirPortefolio(meses, projetos, "euro", true).avisoHoras,
    ).toBeNull();
    expect(
      construirPortefolio(meses, projetos, "jovem", true).avisoHoras,
    ).toBeNull();
  });
});
