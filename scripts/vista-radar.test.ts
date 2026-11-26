import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ondeFariaDiferenca } from "@/lib/radar";
import { construirRadar, simularNovoProjeto } from "@/lib/vista-radar";
import type { Contexto, ImpactoAcao, Projeto, RadarCelula } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const dados = {
  radar: ler<RadarCelula[]>("public/data/radar.json"),
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
};
const texto = (s: string) => s.replace(/ /g, " ");

describe("ondeFariaDiferenca", () => {
  it("as 5 primeiras células Reforçar sem ação, da maior necessidade", () => {
    expect(
      ondeFariaDiferenca(dados.radar).map((c) => `${c.pais} ${c.area}`),
    ).toEqual([
      "Mocambique saude",
      "Uganda tecnologia",
      "Uganda saude",
      "Quenia saude",
      "Quenia tecnologia",
    ]);
  });
});

describe("construirRadar", () => {
  const v = construirRadar(dados, "educacao");
  it("os 12 países da área, com «sem dado» à parte", () => {
    expect(v.pontos).toHaveLength(12);
    expect(v.grupos.semDado.map((c) => c.pais).sort()).toEqual([
      "Ghana",
      "Mocambique",
    ]);
    expect(v.medianaTexto).toBe("56");
    expect(v.mediana).toBeCloseTo(55.8333, 3);
  });
  it("as frases do Senegal: a posição e a evidência da ação", () => {
    const s = v.pontos.find((p) => p.pais === "Senegal");
    expect(s?.necessidadeTexto).toBe(
      "o Senegal é o 4.º país com mais necessidade em educação, entre os 10 países com dado.",
    );
    expect(s?.evidenciaTexto).toBe("Evidência: 57 em 100, da ação P07.");
  });
  it("sem «percentil» e sem as palavras da saúde", () => {
    const tudo = JSON.stringify({ pontos: v.pontos, onde: v.ondeFaria });
    expect(tudo).not.toMatch(/percentil|forte|a acompanhar|a rever/i);
  });
});

describe("simularNovoProjeto", () => {
  it("Senegal, educação, 100 000 €: avançar, cerca de 69 beneficiários", () => {
    const r = simularNovoProjeto(dados, {
      pais: "Senegal",
      area: "educacao",
      formato: "apoio ao estudo",
      orcamento: 100000,
    });
    expect(r?.leitura).toBe("avançar");
    expect(texto(r?.resumo ?? "")).toContain(
      "cerca de 69 beneficiários, contados como nos relatórios mensais",
    );
  });
});
