import { fimDeAno } from "@/lib/fim-de-ano";
import { euros, numero, percentagem } from "@/lib/format";
import { iis, type Pesos, PREDEFINICOES, rankingIIS } from "@/lib/iis";
import { nomeArea, nomePais } from "@/lib/nomes";
import type {
  Contexto,
  ImpactoAcao,
  Mes,
  NivelSaude,
  Projeto,
  Regiao,
} from "@/types";

/** Uma ação com o nome, o país, a região e a área, para as listas e os filtros. */
export type Acao = ImpactoAcao & {
  nome: string;
  pais: string;
  regiao: Regiao | null;
  area: string;
};

export function juntarAcoes(
  impacto: ImpactoAcao[],
  projetos: Projeto[],
  contexto: Contexto[],
): Acao[] {
  const porId = new Map(projetos.map((p) => [p.id, p]));
  const regiao = new Map(contexto.map((c) => [c.pais, c.regiao]));
  return impacto.map((a) => {
    const p = porId.get(a.projeto);
    return {
      ...a,
      nome: p?.nome ?? a.projeto,
      pais: p?.pais ?? "",
      regiao: (p && regiao.get(p.pais)) ?? null,
      area: p?.area ?? "",
    };
  });
}

/**
 * A saúde da ação numa palavra, a partir das 5 lentes: «a rever» com 2 ou mais lentes a rever;
 * «forte» com 3 ou mais fortes e nenhuma a rever; senão, «a acompanhar».
 */
export function saudeGeral(acao: ImpactoAcao): NivelSaude {
  const niveis = Object.values(acao.saude).map((l) => l.nivel);
  const rever = niveis.filter((n) => n === "a rever").length;
  const forte = niveis.filter((n) => n === "forte").length;
  if (rever >= 2) return "a rever";
  if (forte >= 3 && rever === 0) return "forte";
  return "a acompanhar";
}

export type Filtros = {
  regiao?: Regiao;
  pais?: string;
  area?: string;
  saude?: NivelSaude;
  confianca?: ImpactoAcao["confianca"];
};

/** As ações que passam todos os filtros dados; um filtro em falta não filtra. */
export function filtrarAcoes(acoes: Acao[], filtros: Filtros): Acao[] {
  return acoes.filter(
    (a) =>
      (!filtros.regiao || a.regiao === filtros.regiao) &&
      (!filtros.pais || a.pais === filtros.pais) &&
      (!filtros.area || a.area === filtros.area) &&
      (!filtros.saude || saudeGeral(a) === filtros.saude) &&
      (!filtros.confianca || a.confianca === filtros.confianca),
  );
}

/** Até 3 ações com pontos de atenção próprios: mais pontos primeiro; num empate, o menor IIS. */
export function precisaAtencao(
  acoes: Acao[],
  pesos: Pesos = PREDEFINICOES.equilibrado.pesos,
): Acao[] {
  return acoes
    .filter((a) => a.pontos.length > 0)
    .sort(
      (a, b) =>
        b.pontos.length - a.pontos.length ||
        iis(a, pesos) - iis(b, pesos) ||
        a.projeto.localeCompare(b.projeto),
    )
    .slice(0, 3);
}

export type Leitura = {
  id: "maisImpacto" | "atencao" | "fimDeAno";
  texto: string;
  /** para onde leva: a ação, ou «Como medimos» */
  ligacao: string;
};

const DIMENSOES = {
  necessidade: "na necessidade",
  escala: "na escala",
  profundidade: "na profundidade",
  duracao: "na duração",
} as const;

/** As 3 leituras do Início, feitas por regras: a ação com mais impacto, a que precisa de atenção e o fim de ano. */
export function leituras(
  acoes: Acao[],
  meses: Mes[],
  pesos: Pesos = PREDEFINICOES.equilibrado.pesos,
): Leitura[] {
  const resultado: Leitura[] = [];
  const [primeira] = rankingIIS(acoes, pesos);
  const melhor = acoes.find((a) => a.projeto === primeira?.projeto);
  if (melhor && primeira) {
    const [dim, p] = (
      Object.entries({
        necessidade: melhor.necessidade.percentil,
        escala: melhor.escala.percentil,
        profundidade: melhor.profundidade.percentil,
        duracao: melhor.duracao.percentil,
      }) as [keyof typeof DIMENSOES, number | null][]
    ).reduce((m, d) => ((d[1] ?? -1) > (m[1] ?? -1) ? d : m));
    resultado.push({
      id: "maisImpacto",
      texto: `O ${melhor.nome} (${nomePais(melhor.pais)}, ${nomeArea(melhor.area)}) tem o maior impacto: ${numero(primeira.iis)} em 100. Destaca-se ${DIMENSOES[dim]} (percentil ${numero(p ?? 0)}).`,
      ligacao: `/acoes/${melhor.projeto}`,
    });
  }

  const [atencao] = precisaAtencao(acoes, pesos);
  resultado.push(
    atencao
      ? {
          id: "atencao",
          texto: `O ${atencao.nome} precisa de atenção: ${atencao.pontos.length === 1 ? "1 ponto" : `${atencao.pontos.length} pontos`} a confirmar com o parceiro.`,
          ligacao: `/acoes/${atencao.projeto}`,
        }
      : {
          id: "atencao",
          texto: "Nenhuma ação tem pontos de atenção próprios.",
          ligacao: "/acoes",
        },
  );

  const f = fimDeAno(meses);
  const custos =
    f.despesaPorMes.subida <= 0
      ? "sem aumento de custos"
      : `com a despesa a subir só ${percentagem(f.despesaPorMes.subida * 100)}`;
  resultado.push({
    id: "fimDeAno",
    texto: `Em novembro e dezembro, os beneficiários sobem ${percentagem(f.beneficiariosPorMes.subida * 100)} em todo o portefólio, ${custos}: por isso comparamos janeiro a outubro. Um beneficiário custa ${euros(f.custoPorBeneficiario.janOut, 0)} nesses meses.`,
    ligacao: "/como-medimos",
  });
  return resultado;
}
