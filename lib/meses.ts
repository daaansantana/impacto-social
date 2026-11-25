import type { Mes } from "@/types";

/** Sem novembro e dezembro, quando `comparaveis`. */
export function filtrarMeses(meses: Mes[], comparaveis: boolean): Mes[] {
  return comparaveis ? meses.filter((m) => !m.fimDeAno) : meses;
}

/** Os meses de um projeto, por ordem. */
export function serieProjeto(_meses: Mes[], _id: string): Mes[] {
  throw new Error("Por fazer: serieProjeto");
}
