import type { Mes } from "@/types";

/** Sem novembro e dezembro, quando `comparaveis`. */
export function filtrarMeses(meses: Mes[], comparaveis: boolean): Mes[] {
  return comparaveis ? meses.filter((m) => !m.fimDeAno) : meses;
}

/** Os meses de um projeto, por ordem. */
export function serieProjeto(meses: Mes[], id: string): Mes[] {
  return meses
    .filter((m) => m.projeto === id)
    .sort((a, b) => a.mes.localeCompare(b.mes));
}
