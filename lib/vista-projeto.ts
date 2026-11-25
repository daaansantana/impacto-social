import { eficiencia } from "@/lib/eficiencia";
import { euros, numero, percentagem } from "@/lib/format";
import { filtrarMeses, serieProjeto } from "@/lib/meses";
import { nomeArea, nomePais } from "@/lib/nomes";
import { ROTULO_COMPARAVEIS, ROTULO_TODOS } from "@/lib/portefolio";
import { resumoProjeto, subidaFimDeAno } from "@/lib/projeto";
import type { Mes, Projeto } from "@/types";

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2024-11" → «nov 2024» */
export const nomeMes = (mes: string) =>
  `${MESES[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;

export type MesProjeto = {
  mes: string;
  rotulo: string;
  fimDeAno: boolean;
  despesa: number;
  beneficiarios: number;
  horasVoluntariado: number;
};

export type SerieProjeto = {
  chave: "despesa" | "beneficiarios" | "horasVoluntariado";
  titulo: string;
  formatar: (v: number) => string;
  /** o resumo para leitores de ecrã */
  resumo: string;
};

export type Indicador = {
  titulo: string;
  valor: string;
  texto: string;
};

export type VistaProjeto = {
  id: string;
  nome: string;
  onde: string;
  parceiro: string;
  periodo: string;
  custo: string;
  posicao: string;
  conclusao: string;
  meses: MesProjeto[];
  series: SerieProjeto[];
  /** pontos de atenção, na linguagem da tabela 2.4 de docs/PLANO-V2.md */
  avisos: { id: "fimDeAno" | "estornos"; titulo: string; texto: string }[];
  porque: Indicador[];
};

const ordinal = (n: number) => `${n}.º`;

const intervalo = (valores: number[], formatar: (v: number) => string) =>
  `Nos 12 projetos, vai de ${formatar(Math.min(...valores))} a ${formatar(Math.max(...valores))}.`;

/** O ecrã 2: um projeto, mês a mês, com os avisos e o porquê. Devolve null se o projeto não existir. */
export function construirProjeto(
  meses: Mes[],
  projetos: Projeto[],
  id: string,
  comparaveis: boolean,
): VistaProjeto | null {
  const projeto = projetos.find((p) => p.id === id);
  const serie = serieProjeto(meses, id);
  if (!projeto || serie.length === 0) return null;

  const ranking = eficiencia(meses, "euro", comparaveis);
  const linha = ranking.find((l) => l.projeto === id);
  if (!linha) return null;
  const total = ranking.length;
  const conclusao =
    linha.posicao === 1
      ? `Um beneficiário custa ${euros(linha.valor, 0)}: é o projeto mais eficiente dos ${total}.`
      : linha.posicao === total
        ? `Um beneficiário custa ${euros(linha.valor, 0)}: é o projeto menos eficiente dos ${total}.`
        : `Um beneficiário custa ${euros(linha.valor, 0)}: é o ${ordinal(linha.posicao)} mais eficiente dos ${total}.`;

  const resumo = resumoProjeto(meses, id, comparaveis);
  const todos = projetos.map((p) => resumoProjeto(meses, p.id, comparaveis));
  const subida = subidaFimDeAno(meses, id);
  const subidaDespesa = subidaFimDeAno(meses, id, "despesa");
  // os estornos e a despesa do mesmo período
  const noPeriodo = filtrarMeses(serie, comparaveis);
  const despesaPeriodo = noPeriodo.reduce((s, m) => s + m.despesa, 0);
  const periodoTexto = comparaveis
    ? "de janeiro a outubro"
    : `dos ${noPeriodo.length} meses`;
  const primeiro = nomeMes(serie[0].mes);
  const ultimo = nomeMes(serie[serie.length - 1].mes);
  const resumoSerie = (titulo: string) =>
    `${titulo} por mês, de ${primeiro} a ${ultimo}, com novembro e dezembro marcados. Os valores estão na tabela por baixo.`;

  return {
    id,
    nome: projeto.nome,
    onde: `${nomePais(projeto.pais)}, ${nomeArea(projeto.area)}`,
    parceiro: `Parceiro ${projeto.parceiro.id}, com índice de capacidade operacional (sem unidade nos dados) de ${projeto.parceiro.capacidade}.`,
    periodo: comparaveis ? ROTULO_COMPARAVEIS : ROTULO_TODOS,
    custo: euros(linha.valor, 0),
    posicao: `${ordinal(linha.posicao)} de ${total}`,
    conclusao,
    meses: serie.map((m) => ({
      mes: m.mes,
      rotulo: nomeMes(m.mes),
      fimDeAno: m.fimDeAno,
      despesa: m.despesa,
      beneficiarios: m.beneficiarios,
      horasVoluntariado: m.horasVoluntariado,
    })),
    series: [
      {
        chave: "despesa",
        titulo: "Despesa",
        formatar: (v) => euros(v, 0),
        resumo: resumoSerie("Despesa"),
      },
      {
        chave: "beneficiarios",
        titulo: "Beneficiários",
        formatar: (v) => numero(v),
        resumo: resumoSerie("Beneficiários"),
      },
      {
        chave: "horasVoluntariado",
        titulo: "Horas de voluntariado",
        formatar: (v) => numero(v),
        resumo: resumoSerie("Horas de voluntariado"),
      },
    ],
    avisos: [
      {
        id: "fimDeAno",
        titulo: "Pico de fim de ano",
        texto:
          subida > 0
            ? `Em novembro e dezembro, os beneficiários sobem ${percentagem(subida * 100)} face a janeiro–outubro, ${subidaDespesa <= 0 ? "sem aumento de custos" : `e a despesa só ${percentagem(subidaDespesa * 100)}`}. Vale confirmar com o parceiro como foram registados.`
            : "Em novembro e dezembro, os beneficiários por mês não sobem face a janeiro–outubro.",
      },
      {
        id: "estornos",
        titulo: "Correções de despesa",
        texto: `As correções de despesa somam ${euros(resumo.estornos, 0)} e já estão abatidas: são ${percentagem((resumo.estornos / despesaPeriodo) * 100, 1)} da despesa ${periodoTexto}. Não trazem referência à despesa original: pedir a referência ao parceiro.`,
      },
    ],
    porque: [
      {
        titulo: "Custo por atividade",
        valor: euros(resumo.custoPorAtividade, 0),
        texto: intervalo(
          todos.map((r) => r.custoPorAtividade),
          (v) => euros(v, 0),
        ),
      },
      {
        titulo: "Reuniões por 100 horas de atividade",
        valor: `${numero(resumo.reunioesPor100hAtividade, 2)} horas`,
        texto: intervalo(
          todos.map((r) => r.reunioesPor100hAtividade),
          (v) => `${numero(v, 2)} horas`,
        ),
      },
    ],
  };
}
