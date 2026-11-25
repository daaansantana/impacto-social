import { filtrarMeses, serieProjeto } from "@/lib/meses";
import type { Mes, ResumoProjeto } from "@/types";

const soma = (meses: Mes[], campo: keyof Mes) =>
  meses.reduce((t, m) => t + (m[campo] as number), 0);

/** O custo por atividade, as reuniões por 100 horas de atividade e os estornos de um projeto. */
export function resumoProjeto(
  meses: Mes[],
  id: string,
  comparaveis: boolean,
): ResumoProjeto {
  const serie = serieProjeto(filtrarMeses(meses, comparaveis), id);
  return {
    custoPorAtividade: soma(serie, "despesa") / soma(serie, "atividades"),
    reunioesPor100hAtividade:
      (soma(serie, "horasReuniao") / soma(serie, "horasAtividade")) * 100,
    estornos: soma(serie, "estornos"),
  };
}

/** Quanto sobem os beneficiários por mês em novembro e dezembro face a janeiro–outubro (0,57 = +57%). */
export function subidaFimDeAno(meses: Mes[], id: string): number {
  const serie = serieProjeto(meses, id);
  const media = (fimDeAno: boolean) => {
    const parte = serie.filter((m) => m.fimDeAno === fimDeAno);
    return soma(parte, "beneficiarios") / parte.length;
  };
  return media(true) / media(false) - 1;
}
