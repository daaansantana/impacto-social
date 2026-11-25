// A forma de public/data/contexto.json (scripts/contexto.py): os 12 países dos projetos e os indicadores do Banco Mundial.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Contexto, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const contexto = ler<Contexto[]>("public/data/contexto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");

describe("contexto.json", () => {
  it("os 12 países dos projetos, com região e coordenadas", () => {
    expect(contexto.map((c) => c.pais).sort()).toEqual(
      projetos.map((p) => p.pais).sort(),
    );
    for (const c of contexto) {
      expect(["África", "América do Sul", "Ásia", "Europa"]).toContain(
        c.regiao,
      );
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.lng)).toBeLessThanOrEqual(180);
    }
  });

  it("cada indicador tem valor e ano juntos, ou nenhum, e a fonte", () => {
    for (const c of contexto)
      for (const [codigo, i] of Object.entries(c.indicadores)) {
        expect(i.valor === null, `${c.pais} ${codigo}`).toBe(i.ano === null);
        if (i.valor !== null) expect(Number.isFinite(i.valor)).toBe(true);
        expect(i.fonte).toMatch(/^Banco Mundial, WDI/);
      }
  });
});
