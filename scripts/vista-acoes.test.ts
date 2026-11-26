import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { escreverFiltros, lerFiltros } from "@/lib/filtros-url";
import { construirAcoes } from "@/lib/vista-acoes";
import type { Contexto, ImpactoAcao, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const dados = {
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
};
const validos = {
  paises: dados.projetos.map((p) => p.pais),
  areas: dados.projetos.map((p) => p.area),
};
const texto = (s: string) => s.replace(/ /g, " ");

describe("filtros no URL", () => {
  it("lê o que conhece e ignora o resto", () => {
    expect(
      lerFiltros(
        "?regiao=%C3%81frica&ordem=eficiencia&pais=Marte&saude=forte",
        validos,
      ),
    ).toEqual({
      filtros: {
        regiao: "África",
        pais: undefined,
        area: undefined,
        saude: "forte",
        confianca: undefined,
      },
      ordem: "eficiencia",
    });
    expect(lerFiltros("", validos).ordem).toBe("iis");
  });
  it("escreve só o que está escolhido, e volta a ler igual", () => {
    const url = escreverFiltros(
      { area: "educacao", confianca: "alta" },
      "escala",
    );
    expect(url).toBe("?area=educacao&confianca=alta&ordem=escala");
    expect(lerFiltros(url, validos).filtros.area).toBe("educacao");
    expect(escreverFiltros({}, "iis")).toBe("");
  });
});

describe("construirAcoes", () => {
  it("as 12 ações pelo IIS, em inteiro", () => {
    const v = construirAcoes(dados, {}, "iis");
    expect(v.contagem).toBe("12 ações");
    expect(v.cartoes[0]).toMatchObject({
      id: "P11",
      iisTexto: "73",
      onde: "Uganda, logística",
    });
    expect(v.cartoes[0].ligacao).toBe("/acoes/P11");
  });
  it("por eficiência, com o custo por beneficiário", () => {
    const v = construirAcoes(dados, {}, "eficiencia");
    expect(v.cartoes.map((c) => c.id).slice(0, 3)).toEqual([
      "P07",
      "P11",
      "P10",
    ]);
    expect(texto(v.cartoes[0].metrica)).toBe("1457 € por beneficiário");
    expect(v.cartoes.at(-1)?.id).toBe("P01");
  });
  it("com filtros: a contagem e o vazio", () => {
    const v = construirAcoes(dados, { regiao: "África" }, "iis");
    expect(v.contagem).toBe("5 de 12 ações");
    expect(v.filtrosAtivos).toBe(1);
    expect(
      construirAcoes(dados, { regiao: "Europa", area: "saude" }, "iis").cartoes,
    ).toHaveLength(0);
  });
  it("«forte», «a acompanhar» e «a rever» só na saúde", () => {
    const v = construirAcoes(dados, {}, "iis");
    for (const c of v.cartoes) {
      const { saude: _saude, ...resto } = c;
      expect(JSON.stringify(resto)).not.toMatch(/forte|a acompanhar|a rever/);
    }
  });
});
