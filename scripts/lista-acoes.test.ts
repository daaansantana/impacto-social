import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { juntarAcoes } from "@/lib/acoes";
import {
  construirListaAcoes,
  escreverSelecao,
  lerSelecao,
  opcoesFiltros,
  ordenarAcoes,
} from "@/lib/lista-acoes";
import type { Contexto, ImpactoAcao, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const contexto = ler<Contexto[]>("public/data/contexto.json");
const acoes = juntarAcoes(impacto, projetos, contexto);
const opcoes = opcoesFiltros(acoes);
const ids = (xs: { projeto: string }[]) => xs.map((x) => x.projeto);

describe("ordenarAcoes", () => {
  // Os mesmos valores esperados que o gabarito impacto.ordem do Dan (origin/main, 724ee36).
  it("por eficiência: do menor para o maior custo por beneficiário", () => {
    const o = ids(ordenarAcoes(acoes, "eficiencia"));
    expect(o.slice(0, 3)).toEqual(["P07", "P11", "P10"]);
    expect(o.at(-1)).toBe("P01");
    const custos = ordenarAcoes(acoes, "eficiencia").map(
      (a) => a.custoPorPessoa.valor,
    );
    expect(custos).toEqual([...custos].sort((a, b) => a - b));
  });

  const P01aP12 = Array.from(
    { length: 12 },
    (_, i) => `P${String(i + 1).padStart(2, "0")}`,
  );

  it("projeto, do menor para o maior: os 12, do P01 ao P12", () => {
    expect(ids(ordenarAcoes(acoes, "projetoAsc"))).toEqual(P01aP12);
  });

  it("projeto, do maior para o menor: os 12, do P12 ao P01", () => {
    expect(ids(ordenarAcoes(acoes, "projetoDesc"))).toEqual(
      [...P01aP12].reverse(),
    );
  });

  it("por projeto, com filtros: a mesma ordem, só com as ações filtradas", () => {
    const filtros = { regiao: "África" as const };
    const asc = construirListaAcoes(impacto, projetos, contexto, {
      filtros,
      ordem: "projetoAsc",
    });
    const desc = construirListaAcoes(impacto, projetos, contexto, {
      filtros,
      ordem: "projetoDesc",
    });
    expect(ids(asc.cartoes)).toEqual(["P02", "P05", "P07", "P11", "P12"]);
    expect(ids(desc.cartoes)).toEqual(["P12", "P11", "P07", "P05", "P02"]);
    expect(asc.cartoes.every((c) => c.destaque === null)).toBe(true);
    expect(desc.cartoes.every((c) => c.destaque === null)).toBe(true);
  });

  it("um link com ordem=projetoAsc ou projetoDesc repõe a ordenação", () => {
    for (const ordem of ["projetoAsc", "projetoDesc"])
      expect(
        lerSelecao(new URLSearchParams(`ordem=${ordem}`), opcoes).ordem,
      ).toBe(ordem);
  });

  it("por alcance: P01 primeiro e P11 no fim", () => {
    const o = ids(ordenarAcoes(acoes, "escala"));
    expect(o[0]).toBe("P01");
    expect(o.at(-1)).toBe("P11");
  });
});

describe("filtros combinados", () => {
  it("região África e confiança média: P05, P07 e P12", () => {
    const l = construirListaAcoes(impacto, projetos, contexto, {
      filtros: { regiao: "África", confianca: "média" },
      ordem: "iis",
    });
    expect(ids(l.cartoes).sort()).toEqual(["P05", "P07", "P12"]);
    expect(l.resumo).toBe("3 de 12 ações");
    expect(l.ativos).toBe(2);
  });

  it("com um terceiro filtro (país Senegal), fica só P07", () => {
    const l = construirListaAcoes(impacto, projetos, contexto, {
      filtros: { regiao: "África", confianca: "média", pais: "Senegal" },
      ordem: "iis",
    });
    expect(ids(l.cartoes)).toEqual(["P07"]);
  });

  it("uma combinação sem ações dá uma lista vazia", () => {
    const l = construirListaAcoes(impacto, projetos, contexto, {
      filtros: { regiao: "Europa", saude: "forte" },
      ordem: "iis",
    });
    expect(l.cartoes).toEqual([]);
    expect(l.resumo).toBe("0 de 12 ações");
  });

  it("cada cartão tem a saúde em texto e abre o detalhe da ação", () => {
    const l = construirListaAcoes(impacto, projetos, contexto, {
      filtros: {},
      ordem: "iis",
    });
    expect(l.cartoes).toHaveLength(12);
    const p11 = l.cartoes.find((c) => c.projeto === "P11");
    expect(p11).toMatchObject({
      saude: "forte",
      saudeTexto: "Forte",
      confiancaTexto: "Confiança alta",
      href: "/acoes/P11",
    });
    expect(l.cartoes.find((c) => c.projeto === "P01")?.saudeTexto).toBe(
      "A rever",
    );
    expect(l.cartoes.find((c) => c.projeto === "P04")?.saudeTexto).toBe(
      "A acompanhar",
    );
  });
});

describe("o URL", () => {
  it("um link partilhado repõe os filtros e a ordenação", () => {
    const url = new URLSearchParams(
      "regiao=%C3%81frica&confianca=m%C3%A9dia&ordem=eficiencia",
    );
    const selecao = lerSelecao(url, opcoes);
    expect(selecao).toEqual({
      filtros: { regiao: "África", confianca: "média" },
      ordem: "eficiencia",
    });
    const l = construirListaAcoes(impacto, projetos, contexto, selecao);
    expect(ids(l.cartoes)).toEqual(["P07", "P12", "P05"]);
  });

  it("escrever e ler dá a mesma seleção; a ordenação por omissão não vai para o URL", () => {
    const s = {
      filtros: { pais: "Peru", saude: "a acompanhar" as const },
      ordem: "escala" as const,
    };
    const q = escreverSelecao(s);
    expect(lerSelecao(new URLSearchParams(q), opcoes)).toEqual(s);
    expect(escreverSelecao({ filtros: {}, ordem: "iis" })).toBe("");
  });

  it("ignora valores que não existem", () => {
    expect(
      lerSelecao(new URLSearchParams("pais=Atlantida&ordem=xpto"), opcoes),
    ).toEqual({ filtros: {}, ordem: "iis" });
  });
});
