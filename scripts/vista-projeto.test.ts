import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { euros, percentagem } from "@/lib/format";
import { construirProjeto, nomeMes } from "@/lib/vista-projeto";
import type { Mes, Projeto } from "@/types";

const meses = JSON.parse(
  readFileSync("public/data/mensal.json", "utf-8"),
) as Mes[];
const projetos = JSON.parse(
  readFileSync("public/data/projetos.json", "utf-8"),
) as Projeto[];
const texto = (s: string) => s.replace(/ /g, " ");
type Valores = Record<string, number>;
const G = JSON.parse(readFileSync("scripts/gabaritos.json", "utf-8")) as {
  projeto: Record<"todos" | "comparaveis", Record<string, Valores>>;
  eficiencia: Record<"todos" | "comparaveis", { despesaPorProjeto: Valores }>;
};

describe("construirProjeto", () => {
  it("P07, em meses comparáveis", () => {
    const v = construirProjeto(meses, projetos, "P07", true);
    if (!v) throw new Error("P07 devia existir");
    expect(texto(v.conclusao)).toBe(
      "Um beneficiário custa 1457 €: é o projeto mais eficiente dos 12.",
    );
    expect(v.posicao).toBe("1.º de 12");
    expect(v.onde).toBe("Senegal, educação");
    expect(v.meses).toHaveLength(24);
    expect(v.meses.filter((m) => m.fimDeAno).map((m) => m.rotulo)).toEqual([
      "nov 2024",
      "dez 2024",
      "nov 2025",
      "dez 2025",
    ]);
    expect(texto(v.avisos[0].texto)).toBe(
      "Em novembro e dezembro, os beneficiários por mês sobem 57% face a janeiro–outubro. Com «meses comparáveis», esse pico fica de fora.",
    );
    expect(texto(v.avisos[1].texto)).toMatch(
      /^Os estornos somam 22 715 € e já estão abatidos/,
    );
    expect(v.porque.map((p) => texto(p.valor))).toEqual([
      "471 €",
      "1,85 horas",
      "67%",
    ]);
    expect(texto(v.porque[0].texto)).toBe(
      "Nos 12 projetos, vai de 384 € a 6473 €.",
    );
  });

  it("o pior e um do meio", () => {
    expect(
      texto(construirProjeto(meses, projetos, "P01", true)?.conclusao ?? ""),
    ).toBe("Um beneficiário custa 4546 €: é o projeto menos eficiente dos 12.");
    expect(construirProjeto(meses, projetos, "P04", true)?.conclusao).toMatch(
      /é o 5\.º mais eficiente dos 12\.$/,
    );
  });

  it("um projeto que não existe", () => {
    expect(construirProjeto(meses, projetos, "P99", true)).toBeNull();
  });

  it("os estornos e a despesa do mesmo período, como nos gabaritos", () => {
    for (const [modo, comparaveis, periodo] of [
      ["comparaveis", true, "de janeiro a outubro"],
      ["todos", false, "dos 24 meses"],
    ] as const)
      for (const { id } of projetos) {
        const estornos = G.projeto[modo][id].estornos;
        const despesa = G.eficiencia[modo].despesaPorProjeto[id];
        const aviso = construirProjeto(
          meses,
          projetos,
          id,
          comparaveis,
        )?.avisos.find((a) => a.id === "estornos");
        expect(texto(aviso?.texto ?? "")).toBe(
          texto(
            `Os estornos somam ${euros(estornos, 0)} e já estão abatidos: são ${percentagem((estornos / despesa) * 100, 1)} da despesa ${periodo}.`,
          ),
        );
      }
  });

  it("P01: 3,0% de janeiro a outubro e 2,9% nos 24 meses", () => {
    const aviso = (comparaveis: boolean) =>
      texto(
        construirProjeto(meses, projetos, "P01", comparaveis)?.avisos[1]
          .texto ?? "",
      );
    expect(aviso(true)).toBe(
      "Os estornos somam 402 269 € e já estão abatidos: são 3,0% da despesa de janeiro a outubro.",
    );
    expect(aviso(false)).toBe(
      "Os estornos somam 466 318 € e já estão abatidos: são 2,9% da despesa dos 24 meses.",
    );
  });

  it("nomeMes", () => {
    expect(nomeMes("2025-12")).toBe("dez 2025");
  });
});
