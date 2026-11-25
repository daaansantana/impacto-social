import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  filtrarAcoes,
  juntarAcoes,
  leituras,
  precisaAtencao,
  saudeGeral,
} from "@/lib/acoes";
import { alcancePortefolio } from "@/lib/iis";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const acoes = juntarAcoes(
  impacto,
  ler<Projeto[]>("public/data/projetos.json"),
  ler<Contexto[]>("public/data/contexto.json"),
);
const meses = ler<Mes[]>("public/data/mensal.json");
const G = ler<{
  impacto: {
    alcance: {
      beneficiariosPorMes: number;
      percentagemNecessidadeAlta: number;
    };
  };
}>("scripts/gabaritos.json");
const texto = (s: string) => s.replace(/ /g, " ");
const ids = (lista: { projeto: string }[]) =>
  lista.map((a) => a.projeto).sort();

describe("alcancePortefolio (gabarito impacto.alcance)", () => {
  it("cerca de 711 beneficiários por mês, 53% onde a necessidade é alta", () => {
    const r = alcancePortefolio(impacto);
    expect(
      Math.abs(r.beneficiariosPorMes - G.impacto.alcance.beneficiariosPorMes),
    ).toBeLessThanOrEqual(0.01);
    expect(
      Math.abs(
        r.percentagemNecessidadeAlta -
          G.impacto.alcance.percentagemNecessidadeAlta,
      ),
    ).toBeLessThanOrEqual(0.01);
    expect(Math.round(r.beneficiariosPorMes)).toBe(711);
    expect(Math.round(r.percentagemNecessidadeAlta)).toBe(53);
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
      "O Projeto 11 (Uganda, logística) tem o maior impacto: 73 em 100. Destaca-se na duração (percentil 100).",
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
