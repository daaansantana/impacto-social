import type {
  GruposRadar,
  LeituraNovoProjeto,
  NovoProjeto,
} from "@/lib/exemplo-radar";
import { euros, numero } from "@/lib/format";
import { nomeArea, nomePais } from "@/lib/nomes";
import type { Contexto, PontoMapa, Quadrante, RadarCelula } from "@/types";

// O ecrã Radar (docs/PLANO-V2.md, secção 3): onde abrir ou reforçar, por área.
// As funções quadrante e novoProjeto entram por parâmetro: hoje as de exemplo, depois as do Dan.

/** A necessidade no mapa: um só laranja, do mais claro (menos necessidade) ao mais escuro. */
export const FAIXAS_NECESSIDADE = [
  { rotulo: "0 a 25", cor: "#f5a06b", ate: 25 },
  { rotulo: "25 a 50", cor: "#e5752f", ate: 50 },
  { rotulo: "50 a 75", cor: "#c0531a", ate: 75 },
  { rotulo: "75 a 100", cor: "#8a350b", ate: 100 },
] as const;
export const COR_SEM_DADO = "#9ca3af";

export function corNecessidade(percentil: number | null): string {
  if (percentil === null) return COR_SEM_DADO;
  return (
    FAIXAS_NECESSIDADE.find((f) => percentil <= f.ate) ??
    FAIXAS_NECESSIDADE[FAIXAS_NECESSIDADE.length - 1]
  ).cor;
}

/** A evidência no mapa: o diâmetro do marcador, de 10 px (0) a 30 px (100). */
export const tamanhoEvidencia = (evidencia: number) =>
  Math.round(10 + (Math.min(100, Math.max(0, evidencia)) / 100) * 20);
export const LEGENDA_EVIDENCIA = [25, 50, 75].map((v) => ({
  rotulo: String(v),
  tamanho: tamanhoEvidencia(v),
}));

export const ZONAS: { quadrante: Quadrante; explicacao: string }[] = [
  {
    quadrante: "Repensar ou apoiar",
    explicacao:
      "Precisa muito, mas as ações rendem pouco: mudar o desenho ou apoiar o parceiro.",
  },
  {
    quadrante: "Reforçar",
    explicacao: "Precisa muito e as ações dão resultado: investir mais aqui.",
  },
  {
    quadrante: "Reavaliar",
    explicacao:
      "Precisa menos e as ações rendem pouco: ver se vale a pena continuar.",
  },
  {
    quadrante: "Manter",
    explicacao:
      "As ações dão resultado, mas a necessidade é menor: manter sem crescer.",
  },
];

export type Opcao = { valor: string; rotulo: string };

export type PontoQuadrante = {
  pais: string;
  /** o código de 3 letras, para o rótulo no gráfico */
  codigo: string;
  /** evidência, de 0 a 100 (eixo horizontal) */
  x: number;
  /** necessidade, de 0 a 100 (eixo vertical) */
  y: number;
  estimado: boolean;
  /** o rótulo do lado esquerdo, quando há outro ponto perto à direita */
  esquerda: boolean;
  descricao: string;
};

export type LinhaDiferenca = {
  pais: string;
  necessidade: string;
  evidencia: string;
  estimado: boolean;
  leitura: string;
  quadrante: Quadrante | null;
};

export type VistaRadar = {
  area: string;
  areaNome: string;
  pontos: PontoMapa[];
  quadrante: {
    limite: number;
    limiteTexto: string;
    pontos: PontoQuadrante[];
    semDado: string[];
  };
  lista: LinhaDiferenca[];
  /** a explicação da etiqueta «estimado» na lista */
  notaEstimado: string | null;
};

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const opcoesAreas = (areas: readonly string[]): Opcao[] =>
  areas.map((a) => ({ valor: a, rotulo: capitalizar(nomeArea(a)) }));

const textoNecessidade = (p: number | null) =>
  p === null ? "Sem dado" : `percentil ${numero(p)}`;
const textoEvidencia = (c: RadarCelula) =>
  c.estimado
    ? `${numero(c.evidencia)} (estimado a partir de ${c.n === 1 ? "1 ação" : `${c.n} ações`} noutros países)`
    : `${numero(c.evidencia)}`;

const ORDEM: (Quadrante | "semDado")[] = [
  "Reforçar",
  "Repensar ou apoiar",
  "Manter",
  "Reavaliar",
  "semDado",
];

/** O Radar de uma área: o mapa, o quadrante e a lista «Onde faria mais diferença». */
export function construirRadar(
  celulas: RadarCelula[],
  contexto: Contexto[],
  area: string,
  limite: number,
  quadrante: (celulas: RadarCelula[], area?: string) => GruposRadar,
): VistaRadar {
  const daArea = celulas.filter((c) => c.area === area);
  const porPais = new Map(contexto.map((c) => [c.pais, c]));

  const pontos: PontoMapa[] = daArea.flatMap((c) => {
    const pais = porPais.get(c.pais);
    if (!pais) return [];
    const nome = nomePais(c.pais);
    const necessidade = textoNecessidade(c.necessidadePercentil);
    return [
      {
        id: c.pais,
        nome,
        latitude: pais.lat,
        longitude: pais.lng,
        cor: corNecessidade(c.necessidadePercentil),
        tamanho: tamanhoEvidencia(c.evidencia),
        rotulo: `${nome}: necessidade ${necessidade}, evidência ${numero(c.evidencia)}${c.estimado ? " (estimado)" : ""}`,
        linhas: [
          `Necessidade: ${necessidade}`,
          `Evidência: ${textoEvidencia(c)}`,
          c.quadrante
            ? `Leitura: ${c.quadrante}`
            : "Leitura: sem dado da necessidade",
        ],
      },
    ];
  });

  const noGrafico = daArea
    .filter((c) => c.necessidadePercentil !== null)
    .sort(
      (a, b) => (b.necessidadePercentil ?? 0) - (a.necessidadePercentil ?? 0),
    );
  // Rótulos à esquerda quando outro ponto está muito perto (as estimadas partilham a mesma evidência).
  const pontosQuadrante: PontoQuadrante[] = noGrafico.map((c, i) => {
    const y = c.necessidadePercentil ?? 0;
    const anterior = noGrafico[i - 1];
    const perto =
      anterior !== undefined &&
      Math.abs(anterior.evidencia - c.evidencia) < 4 &&
      Math.abs((anterior.necessidadePercentil ?? 0) - y) < 7;
    return {
      pais: nomePais(c.pais),
      codigo: porPais.get(c.pais)?.iso3 ?? c.pais.slice(0, 3).toUpperCase(),
      x: c.evidencia,
      y,
      estimado: c.estimado,
      esquerda: perto && i % 2 === 1,
      descricao: `${nomePais(c.pais)}: necessidade ${textoNecessidade(c.necessidadePercentil)}, evidência ${textoEvidencia(c)}, ${c.quadrante}`,
    };
  });

  const grupos = quadrante(celulas, area);
  const lista: LinhaDiferenca[] = ORDEM.flatMap((q) =>
    grupos[q].map((c) => ({
      pais: nomePais(c.pais),
      necessidade:
        c.necessidadePercentil === null
          ? "Sem dado"
          : numero(c.necessidadePercentil),
      evidencia: numero(c.evidencia),
      estimado: c.estimado,
      leitura: c.quadrante ?? "Sem dado da necessidade",
      quadrante: c.quadrante,
    })),
  );

  return {
    area,
    areaNome: nomeArea(area),
    pontos,
    quadrante: {
      limite,
      limiteTexto: numero(limite),
      pontos: pontosQuadrante,
      semDado: daArea
        .filter((c) => c.necessidadePercentil === null)
        .map((c) => nomePais(c.pais)),
    },
    lista,
    notaEstimado: daArea.some((c) => c.estimado)
      ? `«Estimado»: sem ação de ${nomeArea(area)} no país, a evidência é a média das ${
          daArea.find((c) => !c.estimado)
            ? `${daArea.filter((c) => !c.estimado).length} `
            : ""
        }ações da mesma área noutros países.`
      : null,
  };
}

// ---- Novo projeto (protótipo) ----

const LEITURA_TEXTO: Record<LeituraNovoProjeto, string> = {
  avançar: "Avançar",
  pilotar: "Pilotar",
  rever: "Rever o desenho",
  "confirmar a necessidade": "Confirmar a necessidade",
};

export type VistaNovoProjeto = {
  alcance: string;
  custo: string;
  necessidade: string;
  confianca: string;
  leitura: string;
  leituraChave: LeituraNovoProjeto;
  motivo: string;
  resumo: string;
};

/** O resultado do novoProjeto em frases curtas para o painel. */
export function vistaNovoProjeto(
  r: NovoProjeto | null,
  celula: RadarCelula | undefined,
  confiancaDaAcao?: (projeto: string) => string | undefined,
): VistaNovoProjeto | null {
  if (!r || !celula) return null;
  const confiancaAcao = r.projeto ? confiancaDaAcao?.(r.projeto) : undefined;
  return {
    alcance: `Cerca de ${numero(Math.round(r.alcance))} beneficiários`,
    custo: `${euros(Math.round(r.custoPorBeneficiario), 0)} por beneficiário`,
    necessidade: textoNecessidade(celula.necessidadePercentil),
    confianca: confiancaAcao
      ? `${capitalizar(confiancaAcao)}: a ação que já existe (${r.projeto})`
      : r.estimado
        ? `${r.n === 1 ? "Baixa" : "Média"}: estimada a partir de ${r.n === 1 ? "1 ação" : `${r.n} ações`} noutros países`
        : "Média: uma ação neste país",
    leitura: LEITURA_TEXTO[r.leitura],
    leituraChave: r.leitura,
    motivo: r.motivo,
    resumo: r.resumo,
  };
}
