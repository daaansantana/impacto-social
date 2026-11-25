import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CENARIOS } from "@/lib/simulador";
import { construirSimulador } from "@/lib/vista-simulador";
import type { Mes, Projeto } from "@/types";

const ler = <T>(caminho: string) =>
  JSON.parse(readFileSync(caminho, "utf-8")) as T;
const meses = ler<Mes[]>("public/data/mensal.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const G = ler<{
  simulacao: {
    cenarios: Record<string, { saldoPorAno: number; movido: number }>;
  };
}>("scripts/gabaritos.json");
const texto = (s: string) => s.replace(/ /g, " ");

describe("construirSimulador", () => {
  const esperado = {
    prudente: ["+113", "0,28 M€"],
    provavel: ["+227", "0,56 M€"],
    otimista: ["+458", "1,12 M€"],
  } as const;

  for (const [id, c] of Object.entries(CENARIOS))
    it(`cenário ${id}, como nos gabaritos e no PRODUCT`, () => {
      const v = construirSimulador(meses, projetos, c.fracao, c.fator);
      expect(v.cenario).toBe(id);
      expect([v.beneficiarios, texto(v.valor)]).toEqual(
        esperado[id as keyof typeof esperado],
      );
      expect(texto(v.movido)).toBe(
        texto(
          `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 2 }).format(G.simulacao.cenarios[id].movido / 1e6)} M€`,
        ),
      );
    });

  it("quem dá, quem recebe, o equilíbrio e a capacidade", () => {
    const v = construirSimulador(meses, projetos, 1, 1.2);
    expect(v.dao.map((d) => d.id)).toEqual(["P12", "P05", "P02", "P01"]);
    expect(v.recebem.map((r) => r.id)).toEqual(["P07", "P11", "P10", "P06"]);
    expect(v.equilibrioTexto).toBe("1,49");
    expect(v.pressupostos).toContain(
      "Beneficiários: a soma dos valores de cada mês. Se as pessoas se repetirem, conta pessoas-mês.",
    );
    expect(texto(v.conclusao)).toBe(
      "Passar 100% do investimento aprovado dos 4 projetos menos eficientes para os 4 mais eficientes chega a mais 227 beneficiários por ano.",
    );
    expect(v.avisoCapacidade).toBe(
      "Os parceiros do Projeto 07 e do Projeto 10 têm o menor índice de capacidade operacional (sem unidade nos dados) dos 12: 36. O simulador não tem a capacidade em conta.",
    );
  });

  it("pressupostos mudados à mão e acima do equilíbrio", () => {
    const v = construirSimulador(meses, projetos, 1, 1.5);
    expect(v.cenario).toBeNull();
    expect(v.compensa).toBe(false);
    expect(v.beneficiarios.startsWith("−")).toBe(true);
  });

  it("sem mover nada", () => {
    const v = construirSimulador(meses, projetos, 0, 1.2);
    expect(v.beneficiarios).toBe("0");
    expect(v.conclusao).toBe(
      "Sem mover investimento, não se ganha nem se perde ninguém.",
    );
  });
});
