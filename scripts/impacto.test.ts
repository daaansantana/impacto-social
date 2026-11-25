// A forma de public/data/impacto.json e dos gabaritos do IIS (scripts/impacto.py).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ImpactoAcao } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const acoes = ler<ImpactoAcao[]>("public/data/impacto.json");
const G = ler<{
  impacto: {
    iis: Record<string, Record<string, number>>;
    ranking: Record<string, string[]>;
  };
}>("scripts/gabaritos.json");
const ids = acoes.map((a) => a.projeto).sort();
const dentro = (p: number | null) => p === null || (p >= 0 && p <= 100);

describe("impacto.json", () => {
  it("as 12 ações, com percentis de 0 a 100", () => {
    expect(ids).toHaveLength(12);
    for (const a of acoes)
      for (const p of [
        a.necessidade.percentil,
        a.escala.percentil,
        a.profundidade.percentil,
        a.duracao.percentil,
        a.custoPorPessoa.percentilInvertido,
      ])
        expect(dentro(p), a.projeto).toBe(true);
  });

  it("a confiança segue o número de pontos próprios", () => {
    for (const a of acoes)
      expect(a.confianca).toBe(
        a.pontos.length === 0
          ? "alta"
          : a.pontos.length === 1
            ? "média"
            : "baixa",
      );
  });

  it("os gabaritos do IIS: 4 predefinições, 12 ações e um ranking cada", () => {
    expect(Object.keys(G.impacto.iis).sort()).toEqual([
      "chegarAMaisPessoas",
      "equilibrado",
      "mudarMaisCadaVida",
      "ondeEMaisPreciso",
    ]);
    for (const [nome, valores] of Object.entries(G.impacto.iis)) {
      expect(Object.keys(valores).sort()).toEqual(ids);
      expect([...G.impacto.ranking[nome]].sort()).toEqual(ids);
    }
  });
});
