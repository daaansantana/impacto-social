import { juntarAcoes } from "@/lib/acoes";
import { euros, milhoes, numero, percentagem } from "@/lib/format";
import { iis, PREDEFINICOES } from "@/lib/iis";
import { ROTULO_SAUDE } from "@/lib/lista-acoes";
import { serieProjeto } from "@/lib/meses";
import { nomeArea, nomeObjetivo, nomePais, rotuloAtividade } from "@/lib/nomes";
import { mailtoDe } from "@/lib/vista-auditor";
import { corIIS } from "@/lib/vista-inicio";
import {
  construirProjeto,
  type MesProjeto,
  type SerieProjeto,
} from "@/lib/vista-projeto";
import type {
  AtividadesAcao,
  Contexto,
  ImpactoAcao,
  Mes,
  NivelSaude,
  PontoMapa,
  Projeto,
} from "@/types";

// O ecrã Ação (/acoes/[id]): resumo, IIS, recursos, saúde e as secções dobradas.
// Os totais e os rácios usam sempre janeiro a outubro (os meses comparáveis).

const PESOS = PREDEFINICOES.equilibrado.pesos;

/** O que pedir a cada parceiro (docs/PLANO-V2.md, secção 2.4). */
export const PEDIDOS_PARCEIRO = [
  "o perfil dos participantes (idade, género e situação)",
  "as listas de presenças, com identificadores anónimos",
  "uma avaliação antes e depois, numa amostra de participantes",
  "a referência à despesa original em cada correção de despesa",
  "o calendário de fecho dos registos de cada mês",
];

/** O indicador da necessidade numa frase (docs/PLANO-V2.md, tabela 2.3). */
const INDICADOR: Record<string, (v: number) => string> = {
  "SE.LPV.PRIM": (v) =>
    `${percentagem(v)} das crianças, aos 10 anos, não leem um texto simples`,
  "SL.UEM.NEET.ZS": (v) =>
    `${percentagem(v)} dos jovens não estudam, não trabalham nem estão em formação`,
  "SH.DYN.MORT": (v) =>
    `${numero(v, 1)} mortes antes dos 5 anos por 1000 nascidos vivos`,
  "IT.NET.USER.ZS": (v) =>
    `${percentagem(v)} das pessoas usam a internet (menos uso, mais necessidade)`,
  "SI.POV.DDAY": (v) => `${percentagem(v, 1)} da população em pobreza extrema`,
};

const LENTES = {
  relevancia: "Relevância",
  eficacia: "Eficácia",
  eficiencia: "Eficiência",
  impacto: "Impacto",
  sustentabilidade: "Sustentabilidade",
} as const;

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const mediana = (xs: number[]) => {
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

/** Os totais de janeiro a outubro de uma ação, a partir do mensal.json. */
export function recursosJanOut(meses: Mes[], id: string) {
  const comp = serieProjeto(meses, id).filter((m) => !m.fimDeAno);
  const soma = (k: keyof Mes) => comp.reduce((s, m) => s + (m[k] as number), 0);
  const despesa = soma("despesa");
  const horasVoluntariado = soma("horasVoluntariado");
  const beneficiarios = soma("beneficiarios");
  const atividades = soma("atividades");
  return {
    meses: comp.length,
    despesa,
    horasVoluntariado,
    beneficiarios,
    estornos: soma("estornos"),
    custoPorBeneficiario: beneficiarios ? despesa / beneficiarios : 0,
    horasPorBeneficiario: beneficiarios ? horasVoluntariado / beneficiarios : 0,
    participantesPorAtividade: atividades
      ? soma("participantes") / atividades
      : 0,
    horasPorAtividade: atividades ? soma("horasAtividade") / atividades : 0,
  };
}

export type LinhaResumo = { rotulo: string; texto: string; semDado?: boolean };
export type DimensaoDetalhe = {
  titulo: string;
  /** de 0 a 100; null quando falta o dado */
  valor: number | null;
  valorTexto: string;
  frase: string;
};
export type PontoAtencao = { id: string; titulo: string; texto: string };

export type VistaDetalhe = {
  id: string;
  nome: string;
  intro: string;
  resumo: LinhaResumo[];
  ponto: PontoMapa | null;
  iis: { valor: number; texto: string };
  dimensoes: DimensaoDetalhe[];
  fonteNecessidade: string;
  recursos: { rotulo: string; valor: string }[];
  relacao: string;
  saude: {
    lente: string;
    nivel: NivelSaude;
    nivelTexto: string;
    frase: string;
  }[];
  evolucao: { meses: MesProjeto[]; series: SerieProjeto[] };
  pontos: PontoAtencao[];
  pedidos: string[];
  mailto: string;
  aprendemos: string[];
};

const emCem = (p: number | null) =>
  p === null ? "sem dado" : `${numero(p)} em 100`;

/** O ecrã Ação; null se a ação não existir nos dados. */
export function construirDetalhe(
  impacto: ImpactoAcao[],
  projetos: Projeto[],
  contexto: Contexto[],
  meses: Mes[],
  atividades: AtividadesAcao[],
  id: string,
): VistaDetalhe | null {
  const acoes = juntarAcoes(impacto, projetos, contexto);
  const a = acoes.find((x) => x.projeto === id);
  const projeto = projetos.find((p) => p.id === id);
  const projetoMeses = construirProjeto(meses, projetos, id, true);
  if (!a || !projeto || !projetoMeses) return null;

  const pais = contexto.find((c) => c.pais === a.pais);
  const r = recursosJanOut(meses, id);
  const valorIIS = iis(a, PESOS);

  // ---- as 4 dimensões ----
  const n = a.necessidade;
  const anos = [
    ...new Set(serieProjeto(meses, id).map((m) => m.mes.slice(0, 4))),
  ].sort();
  const dimensoes: DimensaoDetalhe[] = [
    {
      titulo: "Necessidade",
      valor: n.percentil,
      valorTexto: emCem(n.percentil),
      frase:
        n.valor === null || n.percentil === null
          ? "Sem dado do Banco Mundial para este país: a necessidade fica fora da conta."
          : `${capitalizar(INDICADOR[n.indicador]?.(n.valor) ?? numero(n.valor, 1))}.`,
    },
    {
      titulo: "Escala",
      valor: a.escala.percentil,
      valorTexto: emCem(a.escala.percentil),
      frase: `${numero(a.escala.beneficiariosPorMes)} beneficiários por mês, de janeiro a outubro.`,
    },
    {
      titulo: "Profundidade",
      valor: a.profundidade.percentil,
      valorTexto: emCem(a.profundidade.percentil),
      frase: `Taxa de conclusão de ${percentagem(a.profundidade.taxaConclusao)} e ${numero(a.profundidade.horasFormacaoPorBenef, 1)} horas de formação por beneficiário.`,
    },
    {
      titulo: "Duração",
      valor: a.duracao.percentil,
      valorTexto: emCem(a.duracao.percentil),
      frase: `Beneficiários ${a.duracao.crescimento >= 0 ? "+" : "−"}${percentagem(Math.abs(a.duracao.crescimento) * 100)} de ${anos[0]} para ${anos[anos.length - 1]}, de janeiro a outubro.`,
    },
  ];
  const indicador = pais?.indicadores[n.indicador];
  const fonteNecessidade =
    n.ano === null
      ? `Fonte: ${indicador?.fonte ?? "Banco Mundial, WDI"} (${n.indicador}), sem dado para este país.`
      : `Fonte: ${indicador?.fonte ?? "Banco Mundial, WDI"} (${n.indicador}), ${n.ano}. Percentil entre os 12 países.`;

  // ---- os pontos de atenção próprios desta ação ----
  // Vêm do impacto.json, com as regras do scripts/impacto.py: as correções de despesa só contam
  // acima de 1,5 vezes a mediana das 12 ações; o fim de ano e o dia 27 ficam em Como medimos.
  const TITULOS: Record<string, string> = {
    correcoes: "Correções de despesa sem referência",
    custoAtividade: "Custo por atividade fora do padrão",
    objetivoArea: "O objetivo e a área não batem",
  };
  const pontos: PontoAtencao[] = a.pontos.map((p) => ({
    id: p.id,
    titulo: TITULOS[p.id] ?? "A confirmar",
    texto: p.texto,
  }));

  // ---- tipo de atividade: os tipos registados no CSV, legíveis ----
  // «formacao_profissional» → «Formação Profissional»
  const tipos = (atividades.find((x) => x.projeto === id)?.tipos ?? []).map(
    rotuloAtividade,
  );
  const listaTipos =
    tipos.length > 1
      ? `${tipos.slice(0, -1).join(", ")} e ${tipos[tipos.length - 1]}`
      : (tipos[0] ?? "");

  // ---- o email ao parceiro ----
  const pedidoTexto = [
    `Assunto: Pedido de informação sobre o ${a.nome}`,
    "",
    "Olá,",
    "",
    `Para medirmos melhor o impacto do ${a.nome}, pedimos que nos enviem:`,
    ...PEDIDOS_PARCEIRO.map((p) => `- ${p};`),
    ...(pontos.length
      ? [
          "",
          "E que nos ajudem a confirmar:",
          ...pontos.map((p) => `- ${p.texto}`),
        ]
      : []),
    "",
    "Obrigada,",
    "Helena Duarte",
  ].join("\n");

  // ---- o que aprendemos ----
  const comDado = dimensoes.filter((d) => d.valor !== null);
  const melhor = comDado.reduce((m, d) =>
    (d.valor ?? 0) > (m.valor ?? 0) ? d : m,
  );
  const pior = comDado.reduce((m, d) =>
    (d.valor ?? 0) < (m.valor ?? 0) ? d : m,
  );
  const custos = acoes.map(
    (x) => recursosJanOut(meses, x.projeto).custoPorBeneficiario,
  );
  const medianaCusto = mediana(custos);
  const posicaoCusto =
    [...custos].sort((x, y) => x - y).indexOf(r.custoPorBeneficiario) + 1;

  return {
    id,
    nome: a.nome,
    intro: `${nomePais(a.pais)}, ${nomeArea(a.area)}. IIS de ${numero(valorIIS)} em 100, com confiança ${a.confianca} nos números.`,
    resumo: [
      tipos.length
        ? { rotulo: "Tipo de atividade", texto: `${listaTipos}.` }
        : { rotulo: "Tipo de atividade", texto: "Sem dado.", semDado: true },
      {
        rotulo: "Objetivo",
        texto: `${capitalizar(nomeObjetivo(projeto.objetivos))}.`,
      },
      {
        rotulo: "Localização",
        texto: `${nomePais(a.pais)}, ${projeto.regiao}${a.regiao ? ` (${a.regiao})` : ""}.`,
      },
      {
        rotulo: "Formato",
        texto: `Cerca de ${numero(r.participantesPorAtividade)} participantes e ${numero(r.horasPorAtividade, 1)} horas por atividade, de janeiro a outubro.`,
      },
      {
        rotulo: "Público",
        texto: "Sem dado: pedir ao parceiro.",
        semDado: true,
      },
    ],
    ponto: pais
      ? {
          id,
          nome: a.nome,
          latitude: pais.lat,
          longitude: pais.lng,
          iis: valorIIS,
          cor: corIIS(valorIIS),
        }
      : null,
    iis: { valor: valorIIS, texto: numero(valorIIS) },
    dimensoes,
    fonteNecessidade,
    recursos: [
      { rotulo: "Despesa", valor: milhoes(r.despesa) },
      { rotulo: "Horas de voluntariado", valor: numero(r.horasVoluntariado) },
      { rotulo: "Beneficiários", valor: numero(r.beneficiarios) },
      {
        rotulo: "Custo por beneficiário",
        valor: euros(r.custoPorBeneficiario, 0),
      },
      {
        rotulo: "Horas de voluntariado por beneficiário",
        valor: numero(r.horasPorBeneficiario, 1),
      },
    ],
    relacao: `De janeiro a outubro (${r.meses} meses, em 2024 e 2025), cada beneficiário custou ${euros(r.custoPorBeneficiario, 0)} e ${numero(r.horasPorBeneficiario, 1)} horas de voluntariado.`,
    saude: (Object.keys(LENTES) as (keyof typeof LENTES)[]).map((l) => ({
      lente: LENTES[l],
      nivel: a.saude[l].nivel,
      nivelTexto: ROTULO_SAUDE[a.saude[l].nivel],
      frase: a.saude[l].frase,
    })),
    evolucao: { meses: projetoMeses.meses, series: projetoMeses.series },
    pontos,
    pedidos: PEDIDOS_PARCEIRO.map((p) => `${capitalizar(p)}.`),
    mailto: mailtoDe(pedidoTexto),
    aprendemos: [
      `Destaca-se na ${melhor.titulo.toLowerCase()} (${melhor.valorTexto}) e fica mais atrás na ${pior.titulo.toLowerCase()} (${pior.valorTexto}).`,
      `Cada beneficiário custa ${euros(r.custoPorBeneficiario, 0)}, ${r.custoPorBeneficiario > medianaCusto ? "acima" : "abaixo"} da mediana das 12 ações (${euros(medianaCusto, 0)}): é a ${posicaoCusto}.ª mais barata.`,
      `A confiança nos números é ${a.confianca}. ${
        pontos.length
          ? `Há ${pontos.length === 1 ? "1 ponto" : `${pontos.length} pontos`} a confirmar com o parceiro.`
          : "Não há pontos próprios a confirmar."
      }`,
    ],
  };
}
