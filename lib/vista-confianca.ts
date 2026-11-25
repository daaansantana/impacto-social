import { numero, percentagem } from "@/lib/format";
import type { Qualidade, Subida } from "@/types";

export type VistaConfianca = {
  conclusao: string;
  notaGenerica: { nota: string; ferramenta: string; resultado: string };
  notaReal: string;
  /** as notas são uma avaliação nossa */
  fonteNotas: string;
  scorecard: {
    dimensao: string;
    nota: number;
    notaTexto: string;
    evidencia: string;
  }[];
  limpeza: {
    id: string;
    titulo: string;
    quantidade: string;
    regra: string;
    nota?: string;
  }[];
  padroes: {
    id: string;
    titulo: string;
    texto: string;
    numero: string;
    /** o que confirmar com o parceiro, na linguagem da tabela 2.4 de docs/PLANO-V2.md */
    confirmar?: string;
  }[];
  fimDeAno: { rotulo: string; janOut: number; novDez: number }[];
  fimDeAnoResumo: string;
};

// Saem do ecrã: falso positivo indicado na mentoria (docs/PLANO-V2.md, secção 1).
const PADROES_FORA = new Set(["voluntarios"]);

const CONFIRMAR: Record<string, string> = {
  fimDeAno: "Vale confirmar com os parceiros como foram registados.",
  dia27: "Confirmar o calendário de fecho do mês.",
};

/** O ecrã 4: a nota genérica contra a real, a limpeza e os padrões. */
export function construirConfianca(q: Qualidade): VistaConfianca {
  const notas = q.scorecard.map((s) => s.nota);
  const min = Math.min(...notas);
  const max = Math.max(...notas);
  // «2 a 4», em 5
  const notaReal = min === max ? `${min}` : `${min} a ${max}`;
  const nota = /Nota (\w)/.exec(q.notaGenerica.resultado)?.[1] ?? "A";

  const anomalia = (id: string) => q.anomalias.find((a) => a.id === id);
  const fda = anomalia("fimDeAno")?.numeros as
    | {
        atividadesPorMes: Subida;
        beneficiariosPorMes: Subida;
        despesaPorMes: Subida;
      }
    | undefined;
  const dia27 = anomalia("dia27")?.numeros as
    | { registosDias28a31: number; registos: number; esperado: number }
    | undefined;
  const semana = anomalia("semana")?.numeros as
    | { aulasAoDomingo: number; despesasAoDomingo: number }
    | undefined;

  const subida = (s?: Subida) =>
    s
      ? `${s.subida >= 0 ? "+" : "−"}${percentagem(Math.abs(s.subida) * 100)}`
      : "";
  const numeroDe: Record<string, string> = {
    fimDeAno: fda
      ? `Atividades ${subida(fda.atividadesPorMes)}, beneficiários ${subida(fda.beneficiariosPorMes)}, despesa ${subida(fda.despesaPorMes)}.`
      : "",
    dia27: dia27
      ? `${numero(dia27.registosDias28a31)} de ${numero(dia27.registos)} registos nos dias 28 a 31; eram de esperar cerca de ${numero(dia27.esperado)}.`
      : "",
    semana: semana
      ? `${percentagem(semana.aulasAoDomingo, 1)} das aulas e ${percentagem(semana.despesasAoDomingo, 1)} das despesas a um domingo.`
      : "",
  };
  const anomalias = q.anomalias.filter((a) => !PADROES_FORA.has(a.id));

  const indice = (s?: Subida) =>
    s
      ? { janOut: 100, novDez: (s.novDez / s.janOut) * 100 }
      : { janOut: 100, novDez: 100 };
  return {
    conclusao: `A validação genérica dá nota ${nota} às 10 tabelas. Olhando de perto, a qualidade fica entre ${min} e ${max} em 5: há ${anomalias.length} padrões que a nota não vê.`,
    notaGenerica: {
      nota,
      ferramenta: q.notaGenerica.ferramenta,
      resultado: q.notaGenerica.resultado,
    },
    notaReal,
    fonteNotas: "Avaliação nossa, segundo a skill exploratory-data-analysis.",
    scorecard: q.scorecard.map((s) => ({
      dimensao: s.dimensao,
      nota: s.nota,
      notaTexto: `${s.nota} em 5`,
      evidencia: s.evidencia,
    })),
    limpeza: q.limpeza.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      quantidade: `${numero(l.quantidade)} de ${numero(l.de)} (${percentagem((l.quantidade / l.de) * 100, 1)})`,
      regra: l.regra,
      nota: l.impacto,
    })),
    padroes: anomalias.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      texto: a.texto,
      numero: numeroDe[a.id] ?? "",
      confirmar: CONFIRMAR[a.id],
    })),
    fimDeAno: [
      { rotulo: "Atividades", ...indice(fda?.atividadesPorMes) },
      { rotulo: "Beneficiários", ...indice(fda?.beneficiariosPorMes) },
      { rotulo: "Despesa", ...indice(fda?.despesaPorMes) },
    ],
    fimDeAnoResumo: fda
      ? `Média por mês, com janeiro a outubro igual a 100. Em novembro e dezembro: atividades ${numero(indice(fda.atividadesPorMes).novDez)}, beneficiários ${numero(indice(fda.beneficiariosPorMes).novDez)} e despesa ${numero(indice(fda.despesaPorMes).novDez)}.`
      : "",
  };
}
