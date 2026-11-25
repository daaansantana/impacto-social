import type { FimDeAno, Mes, Subida } from "@/types";

type Campo = "atividades" | "beneficiarios" | "despesa";
const CAMPOS: Campo[] = ["atividades", "beneficiarios", "despesa"];

/** As médias mensais de janeiro a outubro contra as de novembro e dezembro. */
export function fimDeAno(meses: Mes[]): FimDeAno {
  // primeiro, o total de cada mês com todos os projetos
  const porMes = new Map<
    string,
    Record<Campo, number> & { fimDeAno: boolean }
  >();
  for (const m of meses) {
    const t = porMes.get(m.mes) ?? {
      fimDeAno: m.fimDeAno,
      atividades: 0,
      beneficiarios: 0,
      despesa: 0,
    };
    for (const c of CAMPOS) t[c] += m[c];
    porMes.set(m.mes, t);
  }
  // depois, a média desses totais em cada parte do ano
  const totais = [...porMes.values()];
  const media = (fimDeAno: boolean, campo: Campo) => {
    const parte = totais.filter((t) => t.fimDeAno === fimDeAno);
    return parte.reduce((s, t) => s + t[campo], 0) / parte.length;
  };
  const subida = (campo: Campo): Subida => {
    const janOut = media(false, campo);
    const novDez = media(true, campo);
    return { janOut, novDez, subida: novDez / janOut - 1 };
  };
  const beneficiarios = subida("beneficiarios");
  const despesa = subida("despesa");
  return {
    atividadesPorMes: subida("atividades"),
    beneficiariosPorMes: beneficiarios,
    despesaPorMes: despesa,
    custoPorBeneficiario: {
      janOut: despesa.janOut / beneficiarios.janOut,
      novDez: despesa.novDez / beneficiarios.novDez,
    },
  };
}
