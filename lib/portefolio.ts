import { eficiencia, totais } from "@/lib/eficiencia";
import { euros, milhoes, numero } from "@/lib/format";
import { filtrarMeses } from "@/lib/meses";
import { nomeArea, nomePais } from "@/lib/nomes";
import type { Mes, Projeto, Totais, Unidade } from "@/types";

export const ROTULO_COMPARAVEIS = "Meses comparáveis (jan–out)";
export const ROTULO_TODOS = "Todos os meses (com novembro e dezembro)";

export const UNIDADES: { id: Unidade; rotulo: string }[] = [
  { id: "euro", rotulo: "Por euro" },
  { id: "hora", rotulo: "Por hora de voluntariado" },
  { id: "jovem", rotulo: "Por jovem formado" },
];

export type LinhaPortefolio = {
  id: string;
  nome: string;
  /** «Senegal, educação» */
  onde: string;
  posicao: number;
  valor: number;
  /** «1457 € por beneficiário» */
  valorTexto: string;
  beneficiarios: number;
  /** «571 beneficiários» */
  alcanceTexto: string;
};

export type VistaPortefolio = {
  linhas: LinhaPortefolio[];
  /** a frase do ecrã: o melhor contra o pior */
  conclusao: string;
  periodo: string;
  /** o que quer dizer o valor e se menos é melhor */
  legenda: string;
  totais: Totais;
  totaisTexto: { beneficiarios: string; despesa: string; custo: string };
};

const VALOR: Record<Unidade, (v: number) => string> = {
  euro: (v) => `${euros(v, 0)} por beneficiário`,
  hora: (v) => `${numero(v, 1)} beneficiários por 1000 horas`,
  jovem: (v) => `${euros(v, 0)} por jovem formado`,
};

const LEGENDA: Record<Unidade, string> = {
  euro: "Quanto custa um beneficiário: despesa a dividir pelos beneficiários. Menos é melhor.",
  hora: "Beneficiários por cada 1000 horas de voluntariado. Mais é melhor.",
  jovem:
    "Quanto custa formar um jovem: despesa a dividir pelos jovens formados. Menos é melhor.",
};

function conclusao(
  unidade: Unidade,
  melhor: LinhaPortefolio,
  pior: LinhaPortefolio,
): string {
  const vezes = numero(pior.valor / melhor.valor, 1);
  switch (unidade) {
    case "euro":
      return `Um beneficiário custa ${euros(melhor.valor, 0)} no ${melhor.nome} e ${euros(pior.valor, 0)} no ${pior.nome}: ${vezes} vezes mais.`;
    case "hora":
      return `Por cada 1000 horas de voluntariado, o ${melhor.nome} chega a ${numero(melhor.valor, 0)} beneficiários e o ${pior.nome} a ${numero(pior.valor, 0)}.`;
    case "jovem":
      return `Formar um jovem custa ${euros(melhor.valor, 0)} no ${melhor.nome} e ${euros(pior.valor, 0)} no ${pior.nome}: ${vezes} vezes mais.`;
  }
}

/** O ecrã 1: o ranking de eficiência, o alcance de cada projeto e os totais. */
export function construirPortefolio(
  meses: Mes[],
  projetos: Projeto[],
  unidade: Unidade,
  comparaveis: boolean,
): VistaPortefolio {
  const filtrados = filtrarMeses(meses, comparaveis);
  const beneficiarios = new Map<string, number>();
  for (const m of filtrados)
    beneficiarios.set(
      m.projeto,
      (beneficiarios.get(m.projeto) ?? 0) + m.beneficiarios,
    );
  const porId = new Map(projetos.map((p) => [p.id, p]));

  const linhas = eficiencia(meses, unidade, comparaveis).map((l) => {
    const p = porId.get(l.projeto);
    const alcance = beneficiarios.get(l.projeto) ?? 0;
    return {
      id: l.projeto,
      nome: p?.nome ?? l.projeto,
      onde: p ? `${nomePais(p.pais)}, ${nomeArea(p.area)}` : "",
      posicao: l.posicao,
      valor: l.valor,
      valorTexto: VALOR[unidade](l.valor),
      beneficiarios: alcance,
      alcanceTexto: `${numero(alcance)} beneficiários`,
    };
  });

  const t = totais(meses, comparaveis);
  return {
    linhas,
    conclusao: linhas.length
      ? conclusao(unidade, linhas[0], linhas[linhas.length - 1])
      : "",
    periodo: comparaveis ? ROTULO_COMPARAVEIS : ROTULO_TODOS,
    legenda: LEGENDA[unidade],
    totais: t,
    totaisTexto: {
      beneficiarios: numero(t.beneficiarios),
      despesa: milhoes(t.despesa),
      custo: euros(t.custoPorBeneficiario, 2),
    },
  };
}
