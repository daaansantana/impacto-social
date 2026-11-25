import type { LinhaEficiencia, Mes, Totais, Unidade } from "@/types";

/** O ranking dos projetos na unidade escolhida, com a posição 1 para o melhor. */
export function eficiencia(
  _meses: Mes[],
  _unidade: Unidade,
  _comparaveis: boolean,
): LinhaEficiencia[] {
  throw new Error("Por fazer: eficiencia");
}

/** A despesa, os beneficiários e as horas de todos os projetos juntos. */
export function totais(_meses: Mes[], _comparaveis: boolean): Totais {
  throw new Error("Por fazer: totais");
}
