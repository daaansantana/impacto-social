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
import { euros, numero, percentagem } from "@/lib/format";
import { iis, PREDEFINICOES } from "@/lib/iis";
import { nomeArea, nomePais } from "@/lib/nomes";
import type { Dados, NivelSaude } from "@/types";

export type CartaoAcao = {
  id: string;
  nome: string;
  /** «Uganda, logística» */
  onde: string;
  /** o IIS a 2 casas, para a barra */
  iis: number;
  /** o IIS em inteiro, com ,5 para cima */
  iisTexto: string;
  saude: NivelSaude;
  confianca: Acao["confianca"];
  /** o valor da ordenação escolhida, numa linha */
  metrica: string;
  ligacao: string;
};

export type Opcao = { valor: string; rotulo: string };

export type VistaAcoes = {
  cartoes: CartaoAcao[];
  total: number;
  /** «12 ações» ou «3 de 12 ações» */
  contagem: string;
  filtrosAtivos: number;
  opcoes: {
    regioes: Opcao[];
    paises: Opcao[];
    areas: Opcao[];
    saude: Opcao[];
    confianca: Opcao[];
    ordenacoes: Opcao[];
  };
};

const PESOS = PREDEFINICOES.equilibrado.pesos;

const METRICA: Record<Ordenacao, (a: Acao) => string> = {
  iis: (a) => `${numero(a.escala.beneficiariosPorMes)} beneficiários por mês`,
  escala: (a) =>
    `${numero(a.escala.beneficiariosPorMes)} beneficiários por mês`,
  profundidade: (a) =>
    `Taxa de conclusão de ${percentagem(a.profundidade.taxaConclusao)}`,
  necessidade: (a) =>
    a.necessidade.percentil === null
      ? "Necessidade sem dado"
      : `Necessidade: ${numero(a.necessidade.percentil)} em 100`,
  eficiencia: (a) =>
    `${euros(a.recursos.custoPorBeneficiario, 0)} por beneficiário`,
};

const unicos = (valores: string[]) => [...new Set(valores)].sort();

/** O ecrã Ações: os cartões filtrados e ordenados, e as opções dos filtros. */
export function construirAcoes(
  dados: Pick<Dados, "impacto" | "projetos" | "contexto">,
  filtros: Filtros,
  ordem: Ordenacao,
): VistaAcoes {
  const todas = juntarAcoes(dados.impacto, dados.projetos, dados.contexto);
  const lista = ordenarAcoes(filtrarAcoes(todas, filtros), ordem, PESOS);
  const filtrosAtivos = Object.values(filtros).filter(Boolean).length;
  return {
    cartoes: lista.map((a) => {
      const valor = iis(a, PESOS);
      return {
        id: a.projeto,
        nome: a.nome,
        onde: `${nomePais(a.pais)}, ${nomeArea(a.area)}`,
        iis: valor,
        iisTexto: numero(valor),
        saude: saudeGeral(a),
        confianca: a.confianca,
        metrica: METRICA[ordem](a),
        ligacao: `/acoes/${a.projeto}`,
      };
    }),
    total: todas.length,
    contagem:
      lista.length === todas.length
        ? `${todas.length} ações`
        : `${lista.length} de ${todas.length} ações`,
    filtrosAtivos,
    opcoes: {
      regioes: unicos(todas.map((a) => a.regiao ?? "").filter(Boolean)).map(
        (r) => ({ valor: r, rotulo: r }),
      ),
      paises: unicos(todas.map((a) => a.pais)).map((p) => ({
        valor: p,
        rotulo: nomePais(p),
      })),
      areas: unicos(todas.map((a) => a.area)).map((a) => ({
        valor: a,
        rotulo: nomeArea(a),
      })),
      saude: ["forte", "a acompanhar", "a rever"].map((s) => ({
        valor: s,
        rotulo: s[0].toUpperCase() + s.slice(1),
      })),
      confianca: ["alta", "média", "baixa"].map((c) => ({
        valor: c,
        rotulo: `Confiança ${c}`,
      })),
      ordenacoes: (Object.entries(ORDENACOES) as [Ordenacao, string][]).map(
        ([valor, rotulo]) => ({ valor, rotulo }),
      ),
    },
  };
}
