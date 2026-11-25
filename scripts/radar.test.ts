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
    const r = novoProjeto(
      {
        pais: "Senegal",
        area: "educacao",
        formato: "apoio ao estudo",
        orcamento: 100000,
      },
      { acoes, contexto, celulas },
    );
    expect(r?.motivo).toBe(
      "Pilotar, com uma avaliação antes e depois: a necessidade de educação no Senegal é alta (percentil 70) e a evidência também (57), mas vem de uma só ação.",
    );
    expect(texto(r?.resumo ?? "")).toBe(
      "Um projeto de apoio ao estudo com 100 000 € chega a cerca de 58 beneficiários, contados como nos relatórios mensais, a 1737 € cada.",
    );
    const semDado = novoProjeto(
      { pais: "Ghana", area: "educacao", formato: "aulas", orcamento: 100000 },
      { acoes, contexto, celulas },
    );
    expect(semDado?.leitura).toBe("rever");
    expect(semDado?.motivo).toBe(
      "Rever: não há dado da necessidade de educação no Gana, por isso não se sabe se é aqui que faz mais diferença.",
    );
  });
});
