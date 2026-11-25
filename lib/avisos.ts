import { percentagem } from "@/lib/format";
import type { Mes } from "@/types";

/** As horas de voluntariado do último ano face ao primeiro (−0,85 = −85%). */
export function variacaoHorasVoluntariado(meses: Mes[]) {
  const porAno = new Map<string, number>();
  for (const m of meses) {
    const ano = m.mes.slice(0, 4);
    porAno.set(ano, (porAno.get(ano) ?? 0) + m.horasVoluntariado);
  }
  const anos = [...porAno.keys()].sort();
  const primeiro = anos[0];
  const ultimo = anos[anos.length - 1];
  return {
    primeiro,
    ultimo,
    variacao: (porAno.get(ultimo) ?? 0) / (porAno.get(primeiro) ?? 1) - 1,
  };
}

/** O aviso das horas incompletas (docs/PERFIL.md, linha 10), quando as horas caem mais de metade de um ano para o outro. */
export function avisoHoras(meses: Mes[]): string | null {
  const { primeiro, ultimo, variacao } = variacaoHorasVoluntariado(meses);
  if (primeiro === ultimo || variacao > -0.5) return null;
  return `As horas de voluntariado de ${ultimo} parecem incompletas (−${percentagem(Math.abs(variacao) * 100)} face a ${primeiro}).`;
}
