import type { ImpactoAcao, NivelSaude } from "@/types";

// O Índice de Impacto Social (docs/PLANO-V2.md, secção 2.1).

export type Dimensao = "necessidade" | "escala" | "profundidade" | "duracao";
export type Pesos = Record<Dimensao, number>;

export const PREDEFINICOES = {
  equilibrado: {
    rotulo: "Equilibrado",
    pesos: { necessidade: 25, escala: 25, profundidade: 30, duracao: 20 },
  },
  chegarAMaisPessoas: {
    rotulo: "Chegar a mais pessoas",
    pesos: { necessidade: 15, escala: 50, profundidade: 20, duracao: 15 },
  },
  mudarMaisCadaVida: {
    rotulo: "Mudar mais cada vida",
    pesos: { necessidade: 20, escala: 10, profundidade: 55, duracao: 15 },
  },
  ondeEMaisPreciso: {
    rotulo: "Onde é mais preciso",
    pesos: { necessidade: 50, escala: 15, profundidade: 20, duracao: 15 },
  },
} as const satisfies Record<string, { rotulo: string; pesos: Pesos }>;
export type Predefinicao = keyof typeof PREDEFINICOES;

/** Os percentis das 4 dimensões; a necessidade pode faltar (sem dado do Banco Mundial). */
export function percentis(acao: ImpactoAcao): Record<Dimensao, number | null> {
  return {
    necessidade: acao.necessidade.percentil,
    escala: acao.escala.percentil,
    profundidade: acao.profundidade.percentil,
    duracao: acao.duracao.percentil,
  };
}

/** IIS = Σ (peso × percentil) ÷ Σ pesos, de 0 a 100. Uma dimensão sem dado sai da conta só para esta ação. */
export function iis(acao: ImpactoAcao, pesos: Pesos): number {
  let soma = 0;
  let total = 0;
  for (const [d, p] of Object.entries(percentis(acao)) as [
    Dimensao,
    number | null,
  ][]) {
    if (p === null || pesos[d] <= 0) continue;
    soma += pesos[d] * p;
    total += pesos[d];
  }
  return total ? soma / total : 0;
}

export type LinhaIIS = { projeto: string; iis: number; posicao: number };

/** As ações do maior IIS para o menor; num empate, o id mais baixo primeiro. */
export function rankingIIS(acoes: ImpactoAcao[], pesos: Pesos): LinhaIIS[] {
  return acoes
    .map((a) => ({ projeto: a.projeto, iis: iis(a, pesos) }))
    .sort((a, b) => b.iis - a.iis || a.projeto.localeCompare(b.projeto))
    .map((l, i) => ({ ...l, posicao: i + 1 }));
}

/** As faixas do IIS: «forte» a partir de 60, «a rever» abaixo de 40 (as mesmas da saúde da ação). */
export function faixaIIS(valor: number): NivelSaude {
  return valor >= 60 ? "forte" : valor < 40 ? "a rever" : "a acompanhar";
}

/** O IIS do portefólio: a média simples das ações, com quantas há em cada faixa. */
export function iisPortefolio(acoes: ImpactoAcao[], pesos: Pesos) {
  const valores = acoes.map((a) => iis(a, pesos));
  const faixas: Record<NivelSaude, number> = {
    forte: 0,
    "a acompanhar": 0,
    "a rever": 0,
  };
  for (const v of valores) faixas[faixaIIS(v)]++;
  return {
    media: valores.length
      ? valores.reduce((s, v) => s + v, 0) / valores.length
      : 0,
    faixas,
  };
}
