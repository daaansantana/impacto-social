// Compara as funções de lib/ com os valores esperados de scripts/gabaritos.json (docs/SPEC.md, secção 5).
// Se um gabarito falhar, não se muda o valor esperado: para-se e avisa-se.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { auditar } from "@/lib/auditor";
import { eficiencia, totais } from "@/lib/eficiencia";
import { fimDeAno } from "@/lib/fim-de-ano";
import { filtrarMeses, serieProjeto } from "@/lib/meses";
import { resumoProjeto, subidaFimDeAno } from "@/lib/projeto";
import { fatorDeEquilibrio, simular } from "@/lib/simulador";
import type { Mes, Projeto, Qualidade, Unidade } from "@/types";

const ler = (caminho: string) =>
  readFileSync(join(process.cwd(), caminho), "utf-8");
const lerJson = <T>(caminho: string) => JSON.parse(ler(caminho)) as T;

type Valores = Record<string, number>;
type Gabaritos = {
  eficiencia: Record<
    "todos" | "comparaveis",
    Record<Unidade, { valor: Valores; posicao: Valores }> & {
      totais: Valores;
      beneficiariosPorProjeto: Valores;
      despesaPorProjeto: Valores;
    }
  >;
  fimDeAno: Record<string, Valores>;
  simulacao: {
    de: string[];
    para: string[];
    investimentoAprovado: Valores;
    cenarios: Record<
      "prudente" | "provavel" | "otimista",
      Valores & { fracaoMovida: number; fatorCustoMarginal: number }
    >;
    fatorDeEquilibrio: number;
    custoMedioComparavel: number;
  };
  qualidade: Valores;
  projeto: Record<"todos" | "comparaveis", Record<string, Valores>> & {
    subidaFimDeAno: Valores;
  };
  auditor: Record<string, Record<string, unknown>>;
};

const G = lerJson<Gabaritos>("scripts/gabaritos.json");
const meses = lerJson<Mes[]>("public/data/mensal.json");
const projetos = lerJson<Projeto[]>("public/data/projetos.json");
const qualidade = lerJson<Qualidade>("public/data/qualidade.json");

const TOLERANCIA = 0.01;
const perto = (real: number, esperado: number) =>
  expect(Math.abs(real - esperado)).toBeLessThanOrEqual(TOLERANCIA + 1e-9);
const pertoDeTodos = (real: Valores, esperado: Valores) => {
  expect(Object.keys(real).sort()).toEqual(Object.keys(esperado).sort());
  for (const chave of Object.keys(esperado))
    perto(real[chave], esperado[chave]);
};

const MODOS = [
  ["todos", false],
  ["comparaveis", true],
] as const;
const UNIDADES: Unidade[] = ["euro", "hora", "jovem"];
const soma = (linhas: Mes[], campo: keyof Mes) =>
  linhas.reduce((t, m) => t + (m[campo] as number), 0);

describe("eficiencia", () => {
  for (const [modo, comparaveis] of MODOS)
    for (const unidade of UNIDADES)
      it(`${modo}, por ${unidade}`, () => {
        const linhas = eficiencia(meses, unidade, comparaveis);
        const esperado = G.eficiencia[modo][unidade];
        pertoDeTodos(
          Object.fromEntries(linhas.map((l) => [l.projeto, l.valor])),
          esperado.valor,
        );
        expect(
          Object.fromEntries(linhas.map((l) => [l.projeto, l.posicao])),
        ).toEqual(esperado.posicao);
      });
});

describe("totais", () => {
  for (const [modo, comparaveis] of MODOS)
    it(modo, () => {
      pertoDeTodos(
        totais(meses, comparaveis),
        G.eficiencia[modo].totais as Valores,
      );
    });
});

describe("filtrarMeses e serieProjeto", () => {
  for (const [modo, comparaveis] of MODOS)
    it(`${modo}: beneficiários e despesa por projeto`, () => {
      const filtrados = filtrarMeses(meses, comparaveis);
      const ids = projetos.map((p) => p.id);
      const porProjeto = (campo: keyof Mes) =>
        Object.fromEntries(
          ids.map((id) => [id, soma(serieProjeto(filtrados, id), campo)]),
        );
      pertoDeTodos(
        porProjeto("beneficiarios"),
        G.eficiencia[modo].beneficiariosPorProjeto,
      );
      pertoDeTodos(porProjeto("despesa"), G.eficiencia[modo].despesaPorProjeto);
    });
});

describe("fimDeAno", () => {
  it("médias mensais de janeiro a outubro e de novembro e dezembro", () => {
    const real = fimDeAno(meses);
    for (const [chave, esperado] of Object.entries(G.fimDeAno))
      pertoDeTodos(real[chave as keyof typeof real], esperado);
  });
});

describe("simular e fatorDeEquilibrio", () => {
  const ranking = () =>
    [...eficiencia(meses, "euro", true)].sort((a, b) => a.posicao - b.posicao);
  const entrada = () => {
    const linhas = ranking();
    return {
      custos: Object.fromEntries(linhas.map((l) => [l.projeto, l.valor])),
      investimento: Object.fromEntries(
        projetos.map((p) => [p.id, p.investimentoAprovado]),
      ),
      // dão os 4 piores por euro em meses comparáveis; recebem os 4 melhores
      de: linhas.slice(-4).map((l) => l.projeto),
      para: linhas.slice(0, 4).map((l) => l.projeto),
      custoMedio: totais(meses, true).custoPorBeneficiario,
    };
  };

  it("quem dá, quem recebe e o investimento aprovado", () => {
    const { de, para, investimento } = entrada();
    expect(de).toEqual(G.simulacao.de);
    expect(para).toEqual(G.simulacao.para);
    pertoDeTodos(investimento, G.simulacao.investimentoAprovado);
  });

  for (const nome of ["prudente", "provavel", "otimista"] as const)
    it(`cenário ${nome}`, () => {
      const { fracaoMovida, fatorCustoMarginal, ...esperado } =
        G.simulacao.cenarios[nome];
      const real = simular({
        ...entrada(),
        fracao: fracaoMovida,
        fator: fatorCustoMarginal,
      });
      pertoDeTodos(real, esperado);
    });

  it("fator de equilíbrio", () => {
    const otimista = simular({ ...entrada(), fracao: 1, fator: 1 });
    perto(fatorDeEquilibrio(otimista), G.simulacao.fatorDeEquilibrio);
  });
});

describe("resumoProjeto", () => {
  for (const [modo, comparaveis] of MODOS)
    for (const { id } of projetos)
      it(`${modo}, ${id}`, () => {
        pertoDeTodos(
          resumoProjeto(meses, id, comparaveis),
          G.projeto[modo][id],
        );
      });
});

describe("subidaFimDeAno", () => {
  for (const { id } of projetos)
    it(id, () => {
      perto(subidaFimDeAno(meses, id), G.projeto.subidaFimDeAno[id]);
    });
});

describe("qualidade.json", () => {
  it("os contadores da limpeza", () => {
    const { dias28a31, ...contadores } = G.qualidade;
    for (const [id, esperado] of Object.entries(contadores))
      expect(qualidade.limpeza.find((l) => l.id === id)?.quantidade).toBe(
        esperado,
      );
    const dia27 = qualidade.anomalias.find((a) => a.id === "dia27");
    expect(dia27?.numeros.registosDias28a31).toBe(dias28a31);
  });
});

describe("auditar", () => {
  for (const ficheiro of Object.keys(G.auditor))
    it(ficheiro, () => {
      const { data } = Papa.parse<Record<string, string>>(
        ler(`public/demo/${ficheiro}`),
        { header: true, delimiter: ";", skipEmptyLines: true },
      );
      const { domingo, ...resto } = auditar(data);
      const { domingo: domingoEsperado, ...restoEsperado } =
        G.auditor[ficheiro];
      perto(domingo ?? Number.NaN, domingoEsperado as number);
      expect(resto).toEqual(restoEsperado);
    });
});
