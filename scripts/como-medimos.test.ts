import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PREDEFINICOES, type Predefinicao } from "@/lib/iis";
import {
  construirComoMedimos,
  NOTA_INDICE,
  predefinicaoDe,
} from "@/lib/vista-como-medimos";
import type { Contexto, ImpactoAcao, Projeto, Qualidade } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const dados = {
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
  qualidade: ler<Qualidade>("public/data/qualidade.json"),
};
const G = ler<{ impacto: { ranking: Record<Predefinicao, string[]> } }>(
  "scripts/gabaritos.json",
);

describe("construirComoMedimos", () => {
  it("o ranking ao vivo de cada predefinição, como nos gabaritos", () => {
    for (const p of Object.keys(PREDEFINICOES) as Predefinicao[]) {
      const v = construirComoMedimos(dados, PREDEFINICOES[p].pesos);
      expect(v.predefinicao).toBe(p);
      expect(v.ranking.map((l) => l.id)).toEqual(G.impacto.ranking[p]);
    }
  });

  it("pesos à mão, pesos a zero e a parte de cada dimensão", () => {
    const mao = { necessidade: 0, escala: 100, profundidade: 0, duracao: 0 };
    const v = construirComoMedimos(dados, mao);
    expect(v.predefinicao).toBeNull();
    expect(v.ranking[0].id).toBe("P01");
    expect(v.partes.escala).toBe("100%");
    const zero = construirComoMedimos(dados, { ...mao, escala: 0 });
    expect(zero.semPesos).toBe(true);
    expect(zero.ranking).toHaveLength(0);
  });

  it("o IIS em inteiro, a nota e a confiança nos dados", () => {
    const v = construirComoMedimos(dados, PREDEFINICOES.equilibrado.pesos);
    expect(v.ranking[0]).toMatchObject({ id: "P11", iisTexto: "73" });
    expect(NOTA_INDICE).toBe(
      "Índice nosso, inspirado nas 5 dimensões do impacto. Os pesos são uma escolha, e pode mudá-los.",
    );
    expect(v.confianca.padroes.map((p) => p.id)).toEqual([
      "fimDeAno",
      "dia27",
      "semana",
    ]);
    expect(
      predefinicaoDe({
        necessidade: 25,
        escala: 25,
        profundidade: 30,
        duracao: 20,
      }),
    ).toBe("equilibrado");
  });
});
