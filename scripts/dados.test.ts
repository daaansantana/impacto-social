// A forma dos dados da app: cada campo numérico é um número finito e as unidades ficam normalizadas.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Mes, Qualidade } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const meses = ler<Mes[]>("public/data/mensal.json");
const qualidade = ler<Qualidade>("public/data/qualidade.json");
const G = ler<{ qualidade: { unidades: number } }>("scripts/gabaritos.json");

const NUMERICOS = [
  "despesa",
  "estornos",
  "atividades",
  "participantes",
  "horasAtividade",
  "horasVoluntariado",
  "voluntariosRegistados",
  "beneficiarios",
  "jovensFormados",
  "horasFormacao",
  "oficinas",
  "taxaConclusao",
  "voluntariosReportados",
  "reunioes",
  "horasReuniao",
] as const;

describe("mensal.json", () => {
  it("288 linhas: 12 projetos em 24 meses, sem repetidos", () => {
    expect(meses).toHaveLength(288);
    expect(new Set(meses.map((m) => `${m.projeto} ${m.mes}`)).size).toBe(288);
  });

  it("só os campos da SPEC, com os tipos certos", () => {
    for (const m of meses) {
      expect(Object.keys(m).sort()).toEqual(
        ["projeto", "mes", "fimDeAno", ...NUMERICOS].sort(),
      );
      expect(m.projeto).toMatch(/^P(0[1-9]|1[0-2])$/);
      expect(m.mes).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(m.fimDeAno).toBe(["11", "12"].includes(m.mes.slice(5)));
      for (const campo of NUMERICOS)
        expect(
          Number.isFinite(m[campo]),
          `${m.projeto} ${m.mes} ${campo}`,
        ).toBe(true);
    }
  });

  it("as unidades dos beneficiários foram normalizadas: 19 corrigidas", () => {
    expect(G.qualidade.unidades).toBe(19);
    expect(qualidade.limpeza.find((l) => l.id === "unidades")?.quantidade).toBe(
      19,
    );
  });
});
