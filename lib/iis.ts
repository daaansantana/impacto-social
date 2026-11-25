import { arredondar } from "@/lib/format";
import type { ImpactoAcao } from "@/types";

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

/**
 * IIS = Σ (peso × percentil) ÷ Σ pesos, de 0 a 100, com os percentis exatos e o resultado arredondado
 * logo a 2 casas (,5 para cima). As faixas e os cortes usam este valor. Uma dimensão sem dado sai da conta.
 */
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
  return total ? arredondar(soma / total, 2) : 0;
}

export type LinhaIIS = { projeto: string; iis: number; posicao: number };

/** As ações do maior IIS para o menor; num empate, o id mais baixo primeiro. */
export function rankingIIS(acoes: ImpactoAcao[], pesos: Pesos): LinhaIIS[] {
  return acoes
    .map((a) => ({ projeto: a.projeto, iis: iis(a, pesos) }))
    .sort((a, b) => b.iis - a.iis || a.projeto.localeCompare(b.projeto))
    .map((l, i) => ({ ...l, posicao: i + 1 }));
}

/** As faixas do IIS. «Forte», «a acompanhar» e «a rever» ficam só para a saúde da ação. */
export const FAIXAS_IIS = ["60 ou mais", "40 a 59", "menos de 40"] as const;
export type FaixaIIS = (typeof FAIXAS_IIS)[number];

export function faixaIIS(valor: number): FaixaIIS {
  return valor >= 60 ? "60 ou mais" : valor >= 40 ? "40 a 59" : "menos de 40";
}

/**
 * O número grande do Início: os beneficiários por mês (média de janeiro a outubro, somando as ações)
 * e a percentagem deles em ações com a necessidade acima do percentil 50.
 */
export function alcancePortefolio(acoes: ImpactoAcao[]) {
  const total = acoes.reduce((s, a) => s + a.escala.beneficiariosPorMes, 0);
  const alta = acoes
    .filter(
      (a) =>
        a.necessidade.percentil !== null &&
        arredondar(a.necessidade.percentil, 2) > 50,
    )
    .reduce((s, a) => s + a.escala.beneficiariosPorMes, 0);
  return {
    beneficiariosPorMes: total,
    percentagemNecessidadeAlta: total ? (alta / total) * 100 : 0,
  };
}
