// O Radar (lib/radar.ts) contra os gabaritos radar.* e o radar.json.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { juntarAcoes } from "@/lib/acoes";
import { arredondar } from "@/lib/format";
import {
  classificar,
  evidencia,
  medianaEvidencia,
  novoProjeto,
  quadrante,
} from "@/lib/radar";
import type {
  Contexto,
  ImpactoAcao,
  Projeto,
  Quadrante,
  RadarCelula,
} from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const contexto = ler<Contexto[]>("public/data/contexto.json");
const celulas = ler<RadarCelula[]>("public/data/radar.json");
const acoes = juntarAcoes(impacto, projetos, contexto);
const G = ler<{
  radar: {
    medianaEvidencia: number;
    evidencia: Record<string, number>;
    celulas: Record<string, Quadrante | null>;
    custoArea: Record<string, number>;
    novoProjeto: Record<
      string,
      {
        custoPorBeneficiario: number;
        alcance: number;
        quadrante: Quadrante | null;
        leitura: string;
      }
    >;
  };
}>("scripts/gabaritos.json");
const texto = (s: string) => s.replace(/ /g, " ");
const mediana = medianaEvidencia(impacto);

describe("evidência e mediana (gabaritos radar.*)", () => {
  it("a evidência de cada ação, a 2 casas", () => {
    expect(
      Object.fromEntries(
        impacto.map((a) => [a.projeto, arredondar(evidencia(a), 2)]),
      ),
    ).toEqual(G.radar.evidencia);
  });
  it("a mediana das 12 ações: 55,83", () => {
    expect(arredondar(mediana, 2)).toBe(G.radar.medianaEvidencia);
    expect(G.radar.medianaEvidencia).toBe(55.83);
  });
});

describe("quadrante", () => {
  it("as 72 células, como nos gabaritos e no radar.json", () => {
    expect(celulas).toHaveLength(72);
    for (const c of celulas) {
      const q = classificar(c.necessidadePercentil, c.evidencia, mediana);
      expect(q, `${c.pais} ${c.area}`).toBe(
        G.radar.celulas[`${c.pais}|${c.area}`],
      );
      expect(q).toBe(c.quadrante);
    }
  });

  it("a verificação cruzada das 12 ações", () => {
    const porQuadrante: Record<string, string[]> = {};
    for (const a of acoes) {
      const c = celulas.find((x) => x.pais === a.pais && x.area === a.area);
      expect(c?.estimado).toBe(false);
      porQuadrante[c?.quadrante ?? "semDado"] = [
        ...(porQuadrante[c?.quadrante ?? "semDado"] ?? []),
        a.projeto,
      ].sort();
    }
    expect(porQuadrante).toEqual({
      Reforçar: ["P07", "P11", "P12"],
      "Repensar ou apoiar": ["P05", "P06", "P08", "P10"],
      Manter: ["P01", "P02", "P09"],
      Reavaliar: ["P03", "P04"],
    });
  });

  it("a evidência estimada é a média exata da área noutros países", () => {
    for (const c of celulas.filter((x) => x.estimado)) {
      const daArea = acoes.filter((a) => a.area === c.area);
      expect(c.n).toBe(daArea.length);
      const media =
        daArea.reduce((s, a) => s + evidencia(a), 0) / daArea.length;
      expect(Math.abs(c.evidencia - media)).toBeLessThan(1e-9);
    }
  });

  it("a logística estimada cai na mediana e fica baixa", () => {
    const log = celulas.filter((c) => c.area === "logistica" && c.estimado);
    for (const c of log) {
      expect(arredondar(c.evidencia, 2)).toBe(55.83);
      expect(["Repensar ou apoiar", "Reavaliar"]).toContain(c.quadrante);
    }
  });

  it("por área, com «sem dado» na educação do Gana e de Moçambique", () => {
    const g = quadrante(celulas, "educacao");
    expect(g.semDado.map((c) => c.pais).sort()).toEqual([
      "Ghana",
      "Mocambique",
    ]);
    expect(Object.values(g).reduce((s, l) => s + l.length, 0)).toBe(12);
  });
});

describe("novoProjeto (protótipo, gabaritos radar.novoProjeto)", () => {
  for (const [chave, esperado] of Object.entries(G.radar.novoProjeto)) {
    const [pais, area, orcamento] = chave.split("|");
    it(chave, () => {
      const r = novoProjeto(
        { pais, area, formato: "oficinas", orcamento: Number(orcamento) },
        { acoes, contexto, celulas },
      );
      expect(r).not.toBeNull();
      if (!r) return;
      expect(
        Math.abs(r.custoPorBeneficiario - esperado.custoPorBeneficiario),
      ).toBeLessThanOrEqual(0.01);
      expect(Math.abs(r.alcance - esperado.alcance)).toBeLessThanOrEqual(0.01);
      expect(r.quadrante).toBe(esperado.quadrante);
      expect(r.leitura).toBe(esperado.leitura);
    });
  }

  it("o motivo e o resumo, letra a letra", () => {
    const dados = { acoes, contexto, celulas };
    const senegal = novoProjeto(
      {
        pais: "Senegal",
        area: "educacao",
        formato: "apoio ao estudo",
        orcamento: 100000,
      },
      dados,
    );
    expect(senegal?.projeto).toBe("P07");
    expect(senegal?.motivo).toBe(
      "Avançar: já existe o P07 aqui e dá resultados acima da mediana das 12 ações, e a necessidade de educação no Senegal está na metade mais alta dos 12 países.",
    );
    expect(texto(senegal?.resumo ?? "")).toBe(
      "Um projeto de apoio ao estudo com 100 000 € chega a cerca de 69 beneficiários, contados como nos relatórios mensais, a 1457 € cada.",
    );
    const gana = novoProjeto(
      { pais: "Ghana", area: "educacao", formato: "aulas", orcamento: 100000 },
      dados,
    );
    expect(gana?.leitura).toBe("confirmar a necessidade");
    expect(gana?.motivo).toBe(
      "Confirmar a necessidade: falta o indicador para este país; confirmar com dados locais antes de decidir.",
    );
    const brasil = novoProjeto(
      { pais: "Brasil", area: "educacao", formato: "aulas", orcamento: 100000 },
      dados,
    );
    expect(brasil?.quadrante).toBe("Manter");
    expect(brasil?.motivo).toBe(
      "Rever: já existe o P01 aqui e as ações desta área dão resultados, mas aqui a necessidade está na metade mais baixa dos 12 países: há sítios onde faria mais diferença.",
    );
    for (const m of [senegal, gana, brasil])
      expect(m?.motivo).not.toMatch(/percentil/);
  });

  it("o P07, o P11 e o P12 avançam; com confiança baixa, no máximo pilotar", () => {
    const dados = { acoes, contexto, celulas };
    for (const a of acoes.filter((x) =>
      ["P07", "P11", "P12"].includes(x.projeto),
    ))
      expect(
        novoProjeto(
          { pais: a.pais, area: a.area, formato: "x", orcamento: 1 },
          dados,
        )?.leitura,
      ).toBe("avançar");
    const comBaixa = acoes.map((a) =>
      a.projeto === "P07" ? { ...a, confianca: "baixa" as const } : a,
    );
    expect(
      novoProjeto(
        { pais: "Senegal", area: "educacao", formato: "x", orcamento: 1 },
        { acoes: comBaixa, contexto, celulas },
      )?.leitura,
    ).toBe("pilotar");
  });

  it("nas células estimadas com uma só ação, no máximo pilotar", () => {
    const soUma = celulas.filter((c) => c.estimado && c.n === 1);
    expect(soUma.length).toBeGreaterThan(0);
    for (const c of soUma) {
      const r = novoProjeto(
        { pais: c.pais, area: c.area, formato: "x", orcamento: 1 },
        { acoes, contexto, celulas },
      );
      expect(r?.leitura).not.toBe("avançar");
    }
  });
});
