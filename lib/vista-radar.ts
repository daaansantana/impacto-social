import { juntarAcoes } from "@/lib/acoes";
import { arredondar, numero } from "@/lib/format";
import {
  emPais,
  fraseNecessidade,
  type Local,
  local,
  nomeArea,
  nomeAtividade,
  nomePais,
} from "@/lib/nomes";
import {
  type EntradaNovoProjeto,
  type GruposRadar,
  medianaEvidencia,
  type NovoProjeto,
  novoProjeto,
  ondeFariaDiferenca,
  posicaoNecessidade,
  quadrante,
} from "@/lib/radar";
import type { Dados, Quadrante, RadarCelula } from "@/types";

// O Radar (docs/PLANO-V2.md, secções 3 e 8, prompt A5). Sem «percentil»: a necessidade diz-se pela posição.

export const AREAS = [
  "educacao",
  "formacao",
  "saude",
  "tecnologia",
  "comunicacao",
  "logistica",
] as const;

/** A cor da necessidade, em 4 níveis (do menos para o mais). */
export const CORES_NECESSIDADE = [
  { ate: 25, cor: "#fde68a", rotulo: "baixa" },
  { ate: 50, cor: "#fbbf24", rotulo: "média-baixa" },
  { ate: 75, cor: "#f97316", rotulo: "média-alta" },
  { ate: 100, cor: "#c2410c", rotulo: "alta" },
];
export const COR_SEM_DADO = "#d4d4d4";

const corDe = (p: number | null) =>
  p === null
    ? COR_SEM_DADO
    : (CORES_NECESSIDADE.find((c) => arredondar(p, 2) <= c.ate)?.cor ??
      CORES_NECESSIDADE[3].cor);

export const ZONAS: { id: Quadrante; texto: string }[] = [
  {
    id: "Reforçar",
    texto: "Muita necessidade e ações que dão resultados: reforçar.",
  },
  {
    id: "Repensar ou apoiar",
    texto:
      "Muita necessidade, mas resultados abaixo da mediana: repensar ou apoiar o parceiro.",
  },
  {
    id: "Manter",
    texto: "Resultados acima da mediana, com menos necessidade: manter.",
  },
  {
    id: "Reavaliar",
    texto: "Menos necessidade e resultados abaixo da mediana: reavaliar.",
  },
];

export type PontoRadar = {
  id: string;
  pais: string;
  nome: string;
  latitude: number;
  longitude: number;
  cor: string;
  /** o diâmetro do marcador, pela evidência */
  tamanho: number;
  necessidade: number | null;
  evidencia: number;
  estimado: boolean;
  quadrante: Quadrante | null;
  /** «o 4.º país com mais necessidade…» ou «sem dado» */
  necessidadeTexto: string;
  /** «57 em 100, da ação P07» ou «55 em 100, estimado a partir de 2 ações» */
  evidenciaTexto: string;
};

export type VistaRadar = {
  area: string;
  areaNome: string;
  medianaTexto: string;
  mediana: number;
  pontos: PontoRadar[];
  grupos: GruposRadar;
  ondeFaria: { id: string; local: Local; titulo: string; texto: string }[];
  opcoes: {
    areas: { valor: string; rotulo: string }[];
    paises: { valor: string; rotulo: string }[];
    formatos: Record<string, string[]>;
  };
};

const evidenciaTexto = (c: RadarCelula, projeto?: string) =>
  `${numero(c.evidencia, 1)} em 100, ${
    c.estimado
      ? `estimado a partir de ${c.n === 1 ? "1 ação" : `${c.n} ações`}`
      : `da ação ${projeto ?? ""}`.trim()
  }`;

/** O ecrã Radar, para uma área. */
export function construirRadar(
  dados: Pick<Dados, "radar" | "impacto" | "projetos" | "contexto">,
  area: string,
): VistaRadar {
  const acoes = juntarAcoes(dados.impacto, dados.projetos, dados.contexto);
  const mediana = medianaEvidencia(dados.impacto);
  const daArea = dados.radar.filter((c) => c.area === area);
  const projetoAqui = (c: RadarCelula) =>
    acoes.find((a) => a.pais === c.pais && a.area === c.area)?.projeto;
  const contexto = new Map(dados.contexto.map((c) => [c.pais, c]));

  const pontos: PontoRadar[] = daArea.map((c) => {
    const pos = posicaoNecessidade(dados.radar, c);
    const lugar = contexto.get(c.pais);
    return {
      id: `${c.pais}-${c.area}`,
      pais: c.pais,
      nome: nomePais(c.pais),
      latitude: lugar?.lat ?? 0,
      longitude: lugar?.lng ?? 0,
      cor: corDe(c.necessidadePercentil),
      tamanho: 12 + (c.evidencia / 100) * 22,
      necessidade: c.necessidadePercentil,
      evidencia: c.evidencia,
      estimado: c.estimado,
      quadrante: c.quadrante,
      necessidadeTexto: pos
        ? `${fraseNecessidade(c.pais, c.area, pos.posicao, pos.comDado)}.`
        : `Sem dado: falta o indicador de ${nomeArea(c.area)} ${emPais(c.pais)}.`,
      evidenciaTexto: `Evidência: ${evidenciaTexto(c, projetoAqui(c))}.`,
    };
  });

  const formatos: Record<string, string[]> = {};
  for (const a of acoes)
    formatos[a.area] = [
      ...new Set([
        ...(formatos[a.area] ?? []),
        ...a.resumo.tiposAtividade.map(nomeAtividade),
      ]),
    ];

  return {
    area,
    areaNome: nomeArea(area),
    mediana,
    // com uma casa: em inteiros, 56,11 (alta) e 55,83 (baixa) apareciam os dois como 56
    medianaTexto: numero(mediana, 1),
    pontos,
    grupos: quadrante(dados.radar, area),
    ondeFaria: ondeFariaDiferenca(dados.radar).map((c) => {
      const pos = posicaoNecessidade(dados.radar, c);
      return {
        id: `${c.pais}-${c.area}`,
        local: local(c.pais, c.area),
        titulo: `${nomeArea(c.area).replace(/^./, (l) => l.toUpperCase())} ${emPais(c.pais)}`,
        texto:
          `${pos ? `${fraseNecessidade(c.pais, c.area, pos.posicao, pos.comDado)}` : ""}. Ainda não há ação; a evidência da área é ${evidenciaTexto(c)}.`.replace(
            /^./,
            (l) => l.toUpperCase(),
          ),
      };
    }),
    opcoes: {
      areas: AREAS.map((a) => ({ valor: a, rotulo: nomeArea(a) })),
      paises: dados.contexto
        .map((c) => ({ valor: c.pais, rotulo: nomePais(c.pais) }))
        .sort((a, b) => a.rotulo.localeCompare(b.rotulo)),
      formatos,
    },
  };
}

export const LEITURAS: Record<NovoProjeto["leitura"], string> = {
  avançar: "Avançar",
  pilotar: "Pilotar",
  rever: "Rever",
  "confirmar a necessidade": "Confirmar a necessidade",
};

/** O painel «Novo projeto» (protótipo). */
export function simularNovoProjeto(
  dados: Pick<Dados, "radar" | "impacto" | "projetos" | "contexto">,
  entrada: EntradaNovoProjeto,
): NovoProjeto | null {
  return novoProjeto(entrada, {
    acoes: juntarAcoes(dados.impacto, dados.projetos, dados.contexto),
    contexto: dados.contexto,
    celulas: dados.radar,
  });
}
