import type { Mes, ResumoProjeto } from "@/types";

/** O custo por atividade, as reuniões por 100 horas de atividade e os estornos de um projeto. */
export function resumoProjeto(
  _meses: Mes[],
  _id: string,
  _comparaveis: boolean,
): ResumoProjeto {
  throw new Error("Por fazer: resumoProjeto");
}

/** Quanto sobem os beneficiários por mês em novembro e dezembro face a janeiro–outubro (0,57 = +57%). */
export function subidaFimDeAno(_meses: Mes[], _id: string): number {
  throw new Error("Por fazer: subidaFimDeAno");
}
