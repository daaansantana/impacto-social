// A forma de public/data/impacto.json e dos gabaritos do IIS (scripts/impacto.py).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { eficiencia } from "@/lib/eficiencia";
import { filtrarMeses, serieProjeto } from "@/lib/meses";
import type { ImpactoAcao, Mes } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const acoes = ler<ImpactoAcao[]>("public/data/impacto.json");
const G = ler<{
  impacto: {
    recursos: Record<string, Record<string, number>>;
    resumo: Record<
      string,
      { participantesPorAtividade: number; horasPorAtividade: number }
    >;
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

  it("recursos e resultados de janeiro a outubro (requisito 2), como nos gabaritos", () => {
    for (const a of acoes)
      for (const [campo, esperado] of Object.entries(
        G.impacto.recursos[a.projeto],
      ))
        expect(
          Math.abs(a.recursos[campo as keyof typeof a.recursos] - esperado),
          `${a.projeto} ${campo}`,
        ).toBeLessThanOrEqual(0.01);
    expect(G.impacto.recursos.P07.custoPorBeneficiario).toBe(1457.3);
    expect(G.impacto.recursos.P07.horasPorBeneficiario).toBe(33.41);
    expect(G.impacto.recursos.P01.custoPorBeneficiario).toBe(4546.04);
    expect(G.impacto.recursos.P01.horasPorBeneficiario).toBe(61.2);
  });

  it("e batem com o mensal.json pelo caminho da app", () => {
    const meses = ler<Mes[]>("public/data/mensal.json");
    const comparaveis = filtrarMeses(meses, true);
    const custo = Object.fromEntries(
      eficiencia(meses, "euro", true).map((l) => [l.projeto, l.valor]),
    );
    for (const a of acoes) {
      const serie = serieProjeto(comparaveis, a.projeto);
      const horas = serie.reduce((s, m) => s + m.horasVoluntariado, 0);
      const benef = serie.reduce((s, m) => s + m.beneficiarios, 0);
      expect(
        Math.abs(a.recursos.custoPorBeneficiario - custo[a.projeto]),
      ).toBeLessThan(1e-6);
      expect(
        Math.abs(a.recursos.horasPorBeneficiario - horas / benef),
      ).toBeLessThan(1e-6);
    }
  });

  it("o resumo: 3 tipos de atividade, e participantes e horas por atividade", () => {
    for (const a of acoes) {
      expect(a.resumo.tiposAtividade, a.projeto).toHaveLength(3);
      expect(a.resumo.participantesPorAtividade).toBeGreaterThan(0);
      expect(a.resumo.horasPorAtividade).toBeGreaterThan(0);
    }
  });

  it("participantes e horas por atividade, como nos gabaritos (as atividades em bruto)", () => {
    for (const a of acoes) {
      const g = G.impacto.resumo[a.projeto];
      expect(
        Math.abs(
          a.resumo.participantesPorAtividade - g.participantesPorAtividade,
        ),
        a.projeto,
      ).toBeLessThanOrEqual(0.01);
      expect(
        Math.abs(a.resumo.horasPorAtividade - g.horasPorAtividade),
        a.projeto,
      ).toBeLessThanOrEqual(0.01);
    }
    expect(G.impacto.resumo.P07).toEqual({
      participantesPorAtividade: 37.87,
      horasPorAtividade: 5.6,
    });
  });
});
