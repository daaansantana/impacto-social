import { eficiencia, totais } from "@/lib/eficiencia";
import { fimDeAno } from "@/lib/fim-de-ano";
import { euros, milhoes, numero, percentagem } from "@/lib/format";
import { filtrarMeses } from "@/lib/meses";
import { nomeArea, nomePais } from "@/lib/nomes";
import type { Mes, Projeto, Totais, Unidade } from "@/types";

export const ROTULO_COMPARAVEIS = "Meses comparáveis (jan–out)";
export const ROTULO_TODOS = "Todos os meses (com novembro e dezembro)";

export const UNIDADES: { id: Unidade; rotulo: string }[] = [
  { id: "euro", rotulo: "Por euro" },
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
  /** 1 = chega a mais beneficiários */
  posicaoAlcance: number;
  /** «10.º em alcance» */
  posicaoAlcanceTexto: string;
  /** no gráfico, só os 4 melhores e o pior levam o nome à vista; o 1.º por baixo e o 2.º à esquerda, para não se taparem */
  nomeNoGrafico: "top" | "bottom" | "left" | null;
};

export type VistaPortefolio = {
  linhas: LinhaPortefolio[];
  /** a frase do ecrã: o melhor contra o pior */
  conclusao: string;
  periodo: string;
  /** o que quer dizer o valor e se menos é melhor */
  legenda: string;
  /** porque o interruptor existe, com os números do pico */
  avisoFimDeAno: string;
  totais: Totais;
  totaisTexto: { beneficiarios: string; despesa: string; custo: string };
  grafico: {
    eixoY: string;
    formatarX: (v: number) => string;
    formatarY: (v: number) => string;
    /** o resumo para leitores de ecrã */
    resumo: string;
  };
};

const EIXO_Y: Record<Unidade, string> = {
  euro: "€ por beneficiário (menos é melhor)",
  jovem: "€ por jovem formado (menos é melhor)",
};

const VALOR: Record<Unidade, (v: number) => string> = {
  euro: (v) => `${euros(v, 0)} por beneficiário`,
  jovem: (v) => `${euros(v, 0)} por jovem formado`,
};

const LEGENDA: Record<Unidade, string> = {
  euro: "Quanto custa um beneficiário: despesa a dividir pelos beneficiários. Menos é melhor.",
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
    case "jovem":
      return `Formar um jovem custa ${euros(melhor.valor, 0)} no ${melhor.nome} e ${euros(pior.valor, 0)} no ${pior.nome}: ${vezes} vezes mais.`;
  }
}

function nomeNoGrafico(
  posicao: number,
  total: number,
): LinhaPortefolio["nomeNoGrafico"] {
  if (posicao === 1) return "bottom";
  if (posicao === 2) return "left";
  return posicao <= 4 || posicao === total ? "top" : null;
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
  // o ranking do impacto total: mais beneficiários primeiro; num empate, o id mais baixo
  const porAlcance = [...beneficiarios]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([id]) => id);

  const ranking = eficiencia(meses, unidade, comparaveis);
  const linhas = ranking.map((l) => {
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
      posicaoAlcance: porAlcance.indexOf(l.projeto) + 1,
      posicaoAlcanceTexto: `${porAlcance.indexOf(l.projeto) + 1}.º em alcance`,
      nomeNoGrafico: nomeNoGrafico(l.posicao, ranking.length),
    };
  });

  const t = totais(meses, comparaveis);
  const pico = fimDeAno(meses);
  const maiorAlcance = [...linhas].sort(
    (a, b) => b.beneficiarios - a.beneficiarios,
  )[0];
  return {
    linhas,
    conclusao: linhas.length
      ? conclusao(unidade, linhas[0], linhas[linhas.length - 1])
      : "",
    periodo: comparaveis ? ROTULO_COMPARAVEIS : ROTULO_TODOS,
    legenda: LEGENDA[unidade],
    avisoFimDeAno: `Em novembro e dezembro, as atividades sobem ${percentagem(pico.atividadesPorMes.subida * 100)} e os beneficiários ${percentagem(pico.beneficiariosPorMes.subida * 100)}, sem mais despesa. Com o interruptor ligado, esses meses ficam de fora.`,
    totais: t,
    totaisTexto: {
      beneficiarios: numero(t.beneficiarios),
      despesa: milhoes(t.despesa),
      custo: euros(t.custoPorBeneficiario, 2),
    },
    grafico: {
      eixoY: EIXO_Y[unidade],
      formatarX: (v) => numero(v),
      formatarY: (v) => numero(v),
      resumo: linhas.length
        ? `Cada projeto pelo alcance e pela eficiência. Chega a mais gente o ${maiorAlcance.nome}, com ${maiorAlcance.alcanceTexto}. É o mais eficiente o ${linhas[0].nome}, com ${linhas[0].valorTexto}. Os valores de todos estão no ranking.`
        : "",
    },
  };
}
