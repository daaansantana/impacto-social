import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  filtrarAcoes,
  juntarAcoes,
  leituras,
  precisaAtencao,
  saudeGeral,
} from "@/lib/acoes";
import { faixaIIS, iisPortefolio, PREDEFINICOES } from "@/lib/iis";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const acoes = juntarAcoes(
  impacto,
  ler<Projeto[]>("public/data/projetos.json"),
  ler<Contexto[]>("public/data/contexto.json"),
);
const meses = ler<Mes[]>("public/data/mensal.json");
const G = ler<{ impacto: { iis: Record<string, Record<string, number>> } }>(
  "scripts/gabaritos.json",
);
const texto = (s: string) => s.replace(/ /g, " ");
const ids = (lista: { projeto: string }[]) =>
  lista.map((a) => a.projeto).sort();
const { pesos } = PREDEFINICOES.equilibrado;

describe("iisPortefolio", () => {
  it("a média simples das 12 ações e a contagem por faixa", () => {
    const esperados = Object.values(G.impacto.iis.equilibrado);
    const media = esperados.reduce((s, v) => s + v, 0) / esperados.length;
    const r = iisPortefolio(impacto, pesos);
    expect(Math.abs(r.media - media)).toBeLessThanOrEqual(0.01);
    const contagem = { "60 ou mais": 0, "40 a 59": 0, "menos de 40": 0 };
    for (const v of esperados) contagem[faixaIIS(v)]++;
    expect(r.faixas).toEqual(contagem);
    expect(Object.values(r.faixas).reduce((s, n) => s + n, 0)).toBe(12);
  });
});

describe("filtrarAcoes", () => {
  it("por região, área, confiança e juntos", () => {
    expect(ids(filtrarAcoes(acoes, { regiao: "África" }))).toEqual([
      "P02",
      "P05",
      "P07",
      "P11",
      "P12",
    ]);
    expect(ids(filtrarAcoes(acoes, { area: "educacao" }))).toEqual([
      "P01",
      "P07",
      "P10",
    ]);
    expect(ids(filtrarAcoes(acoes, { confianca: "alta" }))).toEqual([
      "P08",
      "P09",
      "P10",
      "P11",
    ]);
    expect(
      ids(filtrarAcoes(acoes, { regiao: "África", confianca: "alta" })),
    ).toEqual(["P11"]);
    expect(filtrarAcoes(acoes, {})).toHaveLength(12);
  });

  it("a saúde divide as 12 ações em três grupos", () => {
    const total = (["forte", "a acompanhar", "a rever"] as const)
      .map((s) => filtrarAcoes(acoes, { saude: s }).length)
      .reduce((a, b) => a + b, 0);
    expect(total).toBe(12);
    for (const a of acoes)
      expect(["forte", "a acompanhar", "a rever"]).toContain(saudeGeral(a));
  });
});

describe("precisaAtencao", () => {
  it("até 3, com mais pontos primeiro e, no empate, o menor IIS", () => {
    expect(precisaAtencao(acoes).map((a) => a.projeto)).toEqual([
      "P03",
      "P01",
      "P02",
    ]);
  });
});

describe("leituras", () => {
  it("as 3 frases do Início", () => {
    const l = leituras(acoes, meses);
    expect(l.map((x) => x.id)).toEqual(["maisImpacto", "atencao", "fimDeAno"]);
    expect(texto(l[0].texto)).toBe(
      "O Projeto 11 (Uganda, logística) tem o maior impacto: 72 em 100. Destaca-se na duração (percentil 100).",
    );
    expect(l[0].ligacao).toBe("/acoes/P11");
    expect(l[1].texto).toBe(
      "O Projeto 03 precisa de atenção: 2 pontos a confirmar com o parceiro.",
    );
    expect(texto(l[2].texto)).toBe(
      "Em novembro e dezembro, os beneficiários sobem 64% em todo o portefólio, sem aumento de custos: por isso comparamos janeiro a outubro. Um beneficiário custa 2451 € nesses meses.",
    );
  });
});
