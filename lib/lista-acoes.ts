import {
  type Acao,
  type Filtros,
  filtrarAcoes,
  juntarAcoes,
  ORDENACOES,
  type Ordenacao,
  ordenarAcoes,
  saudeGeral,
} from "@/lib/acoes";
import { euros, numero } from "@/lib/format";
import { iis, type Pesos, PREDEFINICOES } from "@/lib/iis";
import { nomeArea, nomePais } from "@/lib/nomes";
import type {
  Contexto,
  ImpactoAcao,
  NivelSaude,
  Projeto,
  Regiao,
} from "@/types";

// A lista do ecrã Ações: os cartões, os filtros e a ordenação, com os filtros no URL.

// A ordenação é a do Dan (lib/acoes.ts): reexporta-se para o ecrã e o hook não mudarem.
export { ORDENACOES, type Ordenacao, ordenarAcoes };
export const ORDEM_POR_OMISSAO: Ordenacao = "iis";

export type CampoFiltro = keyof Filtros;
export const CAMPOS_FILTRO: {
  chave: CampoFiltro;
  rotulo: string;
  todos: string;
}[] = [
  { chave: "regiao", rotulo: "Região", todos: "Todas as regiões" },
  { chave: "pais", rotulo: "País", todos: "Todos os países" },
  { chave: "area", rotulo: "Área", todos: "Todas as áreas" },
  { chave: "saude", rotulo: "Saúde", todos: "Qualquer saúde" },
  { chave: "confianca", rotulo: "Confiança", todos: "Qualquer confiança" },
];

export type Opcao = { valor: string; rotulo: string };

export const ROTULO_SAUDE: Record<NivelSaude, string> = {
  forte: "Forte",
  "a acompanhar": "A acompanhar",
  "a rever": "A rever",
};
const NIVEIS_SAUDE: NivelSaude[] = ["forte", "a acompanhar", "a rever"];
const NIVEIS_CONFIANCA: ImpactoAcao["confianca"][] = ["alta", "média", "baixa"];
const REGIOES: Regiao[] = ["África", "América do Sul", "Ásia", "Europa"];

/** As opções de cada filtro: só as que existem nas ações, por ordem alfabética (a saúde e a confiança, do melhor para o pior). */
export function opcoesFiltros(acoes: Acao[]): Record<CampoFiltro, Opcao[]> {
  const unicos = (vals: string[], rotulo: (v: string) => string) =>
    [...new Set(vals.filter(Boolean))]
      .map((v) => ({ valor: v, rotulo: rotulo(v) }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt"));
  return {
    regiao: REGIOES.filter((r) => acoes.some((a) => a.regiao === r)).map(
      (r) => ({ valor: r, rotulo: r }),
    ),
    pais: unicos(
      acoes.map((a) => a.pais),
      nomePais,
    ),
    area: unicos(
      acoes.map((a) => a.area),
      (v) => {
        const n = nomeArea(v);
        return n.charAt(0).toUpperCase() + n.slice(1);
      },
    ),
    saude: NIVEIS_SAUDE.map((s) => ({ valor: s, rotulo: ROTULO_SAUDE[s] })),
    confianca: NIVEIS_CONFIANCA.map((c) => ({
      valor: c,
      rotulo: c.charAt(0).toUpperCase() + c.slice(1),
    })),
  };
}

/** O que o URL guarda: os filtros e a ordenação. Um valor que não existe é ignorado. */
export type Selecao = { filtros: Filtros; ordem: Ordenacao };

export function lerSelecao(
  params: { get: (nome: string) => string | null },
  opcoes: Record<CampoFiltro, Opcao[]>,
): Selecao {
  const filtros: Record<string, string> = {};
  for (const { chave } of CAMPOS_FILTRO) {
    const v = params.get(chave);
    if (v && opcoes[chave].some((o) => o.valor === v)) filtros[chave] = v;
  }
  const o = params.get("ordem");
  const ordem = o && o in ORDENACOES ? (o as Ordenacao) : ORDEM_POR_OMISSAO;
  return { filtros: filtros as Filtros, ordem };
}

/** A query string da seleção, sem os valores por omissão: «?pais=Peru&ordem=eficiencia». */
export function escreverSelecao({ filtros, ordem }: Selecao): string {
  const p = new URLSearchParams();
  for (const { chave } of CAMPOS_FILTRO) {
    const v = filtros[chave];
    if (v) p.set(chave, v);
  }
  if (ordem !== ORDEM_POR_OMISSAO) p.set("ordem", ordem);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export type CartaoAcao = {
  projeto: string;
  nome: string;
  pais: string;
  area: string;
  /** de 0 a 100 */
  iis: number;
  iisTexto: string;
  saude: NivelSaude;
  saudeTexto: string;
  confiancaTexto: string;
  /** o valor da ordenação escolhida, quando não é o IIS: «1457 € por beneficiário» */
  destaque: string | null;
  href: string;
};

export type ListaAcoes = {
  cartoes: CartaoAcao[];
  opcoes: Record<CampoFiltro, Opcao[]>;
  /** «4 de 12 ações» */
  resumo: string;
  /** quantos filtros estão ativos */
  ativos: number;
};

const destaque = (a: Acao, ordem: Ordenacao): string | null => {
  switch (ordem) {
    case "eficiencia":
      return `${euros(a.recursos.custoPorBeneficiario, 0)} por beneficiário`;
    case "escala":
      return `${numero(a.escala.beneficiariosPorMes)} beneficiários por mês`;
    case "profundidade":
      return `Profundidade: percentil ${numero(a.profundidade.percentil)}`;
    case "necessidade":
      return a.necessidade.percentil === null
        ? "Necessidade: sem dado"
        : `Necessidade: percentil ${numero(a.necessidade.percentil)}`;
    default:
      return null;
  }
};

/** A lista de Ações: junta os dados, filtra, ordena e prepara um cartão por ação. */
export function construirListaAcoes(
  impacto: ImpactoAcao[],
  projetos: Projeto[],
  contexto: Contexto[],
  selecao: Selecao,
  pesos: Pesos = PREDEFINICOES.equilibrado.pesos,
): ListaAcoes {
  const acoes = juntarAcoes(impacto, projetos, contexto);
  const filtradas = ordenarAcoes(
    filtrarAcoes(acoes, selecao.filtros),
    selecao.ordem,
    pesos,
  );
  return {
    cartoes: filtradas.map((a) => {
      const valor = iis(a, pesos);
      const saude = saudeGeral(a);
      return {
        projeto: a.projeto,
        nome: a.nome,
        pais: nomePais(a.pais),
        area: nomeArea(a.area),
        iis: valor,
        iisTexto: numero(valor),
        saude,
        saudeTexto: ROTULO_SAUDE[saude],
        confiancaTexto: `Confiança ${a.confianca}`,
        destaque: destaque(a, selecao.ordem),
        href: `/acoes/${a.projeto}`,
      };
    }),
    opcoes: opcoesFiltros(acoes),
    resumo:
      filtradas.length === acoes.length
        ? `${acoes.length} ações`
        : `${filtradas.length} de ${acoes.length} ações`,
    ativos: Object.values(selecao.filtros).filter(Boolean).length,
  };
}
