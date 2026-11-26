import { juntarAcoes } from "@/lib/acoes";
import { arredondar, euros, milhoes, numero, percentagem } from "@/lib/format";
import { faixaIIS, iis, PREDEFINICOES } from "@/lib/iis";
import {
  fraseNecessidade,
  nomeArea,
  nomeAtividade,
  nomePais,
} from "@/lib/nomes";
import { mailtoDe } from "@/lib/vista-auditor";
import { construirProjeto, type VistaProjeto } from "@/lib/vista-projeto";
import type { Dados, NivelSaude } from "@/types";

// O ecrã Ação (docs/PLANO-V2.md, secção 3 e prompt A4). As contas usam valores exatos;
// arredonda-se só para mostrar.

const PESOS = PREDEFINICOES.equilibrado.pesos;

const LENTES = {
  relevancia: "Relevância",
  eficacia: "Eficácia",
  eficiencia: "Eficiência",
  impacto: "Impacto",
  sustentabilidade: "Sustentabilidade",
} as const;

/** O indicador da necessidade numa frase (docs/PLANO-V2.md, tabela 2.3). */
const INDICADOR: Record<string, (v: number) => string> = {
  "SE.LPV.PRIM": (v) =>
    `${percentagem(v, 1)} das crianças de 10 anos não conseguem ler um texto simples`,
  "SL.UEM.NEET.ZS": (v) =>
    `${percentagem(v, 1)} dos jovens não estudam, não trabalham nem estão em formação`,
  "SH.DYN.MORT": (v) =>
    `morrem ${numero(v, 1)} crianças antes dos 5 anos por cada 1000 nascidas vivas`,
  "IT.NET.USER.ZS": (v) => `${percentagem(v, 1)} das pessoas usam a internet`,
  "SI.POV.DDAY": (v) =>
    `${percentagem(v, 1)} das pessoas vivem em pobreza extrema`,
};

export const PEDIDOS_PARCEIRO = [
  "o perfil dos participantes (idade, género e situação)",
  "as listas de presenças, com identificadores anónimos",
  "uma avaliação antes e depois, numa amostra",
  "a referência à despesa original em cada correção de despesa",
  "o calendário de fecho do mês",
];

export type Dimensao = {
  id: "necessidade" | "escala" | "profundidade" | "duracao";
  titulo: string;
  /** de 0 a 100, exato; null sem dado */
  valor: number | null;
  /** «92 em 100» ou «sem dado» */
  valorTexto: string;
  frase: string;
};

export type VistaAcao = {
  id: string;
  nome: string;
  onde: string;
  intro: string;
  resumo: { rotulo: string; texto: string }[];
  iisTexto: string;
  faixa: string;
  dimensoes: Dimensao[];
  fonteNecessidade: string;
  recursos: { rotulo: string; valor: string }[];
  relacao: string;
  saude: { lente: string; nivel: NivelSaude; frase: string }[];
  confianca: string;
  evolucao: Pick<VistaProjeto, "meses" | "series">;
  pontos: string[];
  pedidos: string[];
  mailto: string;
  aprendemos: string[];
};

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lista = (itens: string[]) =>
  itens.length > 1
    ? `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`
    : (itens[0] ?? "");
const mediana = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** O ecrã de uma ação; null se a ação não existir. */
export function construirAcao(
  dados: Pick<Dados, "impacto" | "projetos" | "contexto" | "mensal">,
  id: string,
): VistaAcao | null {
  const acoes = juntarAcoes(dados.impacto, dados.projetos, dados.contexto);
  const a = acoes.find((x) => x.projeto === id);
  const projeto = dados.projetos.find((p) => p.id === id);
  const evolucao = construirProjeto(dados.mensal, dados.projetos, id, true);
  if (!a || !projeto || !evolucao) return null;

  const valorIIS = iis(a, PESOS);
  const anos = [...new Set(dados.mensal.map((m) => m.mes.slice(0, 4)))].sort();
  const n = a.necessidade;
  const emCem = (v: number | null) =>
    v === null ? "sem dado" : `${numero(arredondar(v, 2))} em 100`;

  const dimensoes: Dimensao[] = [
    {
      id: "necessidade",
      titulo: "Necessidade",
      valor: n.percentil,
      valorTexto: emCem(n.percentil),
      frase:
        n.valor === null || n.posicao === null
          ? `Sem dado do indicador para ${nomePais(a.pais)}.`
          : `${capitalizar(INDICADOR[n.indicador]?.(n.valor) ?? numero(n.valor, 1))}: ${fraseNecessidade(a.pais, a.area, n.posicao, n.paisesComDado)}.`,
    },
    {
      id: "escala",
      titulo: "Escala",
      valor: a.escala.percentil,
      valorTexto: emCem(a.escala.percentil),
      frase: `${numero(a.escala.beneficiariosPorMes)} beneficiários por mês, de janeiro a outubro.`,
    },
    {
      id: "profundidade",
      titulo: "Profundidade",
      valor: a.profundidade.percentil,
      valorTexto: emCem(a.profundidade.percentil),
      frase: `Taxa de conclusão de ${percentagem(a.profundidade.taxaConclusao)} e ${numero(a.profundidade.horasFormacaoPorBenef, 1)} horas de formação por beneficiário.`,
    },
    {
      id: "duracao",
      titulo: "Duração",
      valor: a.duracao.percentil,
      valorTexto: emCem(a.duracao.percentil),
      frase: `Beneficiários ${a.duracao.crescimento >= 0 ? "+" : "−"}${percentagem(Math.abs(a.duracao.crescimento) * 100)} de ${anos[0]} para ${anos[anos.length - 1]}, de janeiro a outubro.`,
    },
  ];

  const r = a.recursos;
  const medianaCusto = mediana(
    acoes.map((x) => x.recursos.custoPorBeneficiario),
  );
  const comDado = dimensoes.filter((d) => d.valor !== null);
  const melhor = comDado.reduce((m, d) =>
    (d.valor ?? 0) > (m.valor ?? 0) ? d : m,
  );
  const pior = comDado.reduce((m, d) =>
    (d.valor ?? 0) < (m.valor ?? 0) ? d : m,
  );

  const pontos = a.pontos.map((p) => p.texto);
  const pedidoTexto = [
    `Assunto: Pedido de informação sobre o ${a.nome}`,
    "",
    "Olá,",
    "",
    `Para medirmos melhor o impacto do ${a.nome}, pedimos que nos enviem:`,
    ...PEDIDOS_PARCEIRO.map((p) => `- ${p};`),
    ...(pontos.length
      ? ["", "E que nos ajudem a confirmar:", ...pontos.map((p) => `- ${p}`)]
      : []),
    "",
    "Obrigada,",
    "Helena Duarte",
  ].join("\n");

  return {
    id,
    nome: a.nome,
    onde: `${nomePais(a.pais)}, ${nomeArea(a.area)}`,
    intro: `${nomePais(a.pais)}, ${nomeArea(a.area)}. Índice de impacto social de ${numero(valorIIS)} em 100, com confiança ${a.confianca} nos números.`,
    resumo: [
      {
        rotulo: "O quê",
        texto: `${capitalizar(lista(a.resumo.tiposAtividade.map(nomeAtividade)))}.`,
      },
      {
        rotulo: "Objetivo declarado",
        texto: `${capitalizar(projeto.objetivos)}.`,
      },
      {
        rotulo: "Onde",
        texto: `${nomePais(a.pais)}${a.regiao ? `, ${a.regiao}` : ""}.`,
      },
      {
        rotulo: "Formato",
        texto: `Cerca de ${numero(a.resumo.participantesPorAtividade)} participantes e ${numero(a.resumo.horasPorAtividade, 1)} horas por atividade, de janeiro a outubro.`,
      },
      { rotulo: "Público", texto: "Sem dado: pedir ao parceiro." },
    ],
    iisTexto: numero(valorIIS),
    faixa: faixaIIS(valorIIS),
    dimensoes,
    fonteNecessidade:
      n.ano === null
        ? `Banco Mundial, WDI (${n.indicador}): sem dado para este país.`
        : `Banco Mundial, WDI (${n.indicador}), ${n.ano}.`,
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
    relacao: `De janeiro a outubro, cada beneficiário custou ${euros(r.custoPorBeneficiario, 0)} e ${numero(r.horasPorBeneficiario, 1)} horas de voluntariado.`,
    saude: (Object.keys(LENTES) as (keyof typeof LENTES)[]).map((l) => ({
      lente: LENTES[l],
      nivel: a.saude[l].nivel,
      frase: a.saude[l].frase,
    })),
    confianca: a.confianca,
    evolucao: { meses: evolucao.meses, series: evolucao.series },
    pontos,
    pedidos: PEDIDOS_PARCEIRO.map((p) => `${capitalizar(p)}.`),
    mailto: mailtoDe(pedidoTexto),
    aprendemos: [
      `Destaca-se na ${melhor.titulo.toLowerCase()} (${melhor.valorTexto}) e fica mais atrás na ${pior.titulo.toLowerCase()} (${pior.valorTexto}).`,
      `Cada beneficiário custa ${euros(r.custoPorBeneficiario, 0)}, ${arredondar(r.custoPorBeneficiario, 2) > arredondar(medianaCusto, 2) ? "acima" : "abaixo"} da mediana das 12 ações (${euros(medianaCusto, 0)}).`,
      pontos.length
        ? `A confiança nos números é ${a.confianca}: ${pontos.length === 1 ? "1 ponto" : `${pontos.length} pontos`} a confirmar com o parceiro.`
        : `A confiança nos números é ${a.confianca}: não há pontos próprios a confirmar.`,
    ],
  };
}
