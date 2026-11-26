import type { Acao } from "@/lib/acoes";
import { arredondar, euros, numero } from "@/lib/format";
import { emPais, nomeArea } from "@/lib/nomes";
import type { Contexto, ImpactoAcao, Quadrante, RadarCelula } from "@/types";

// O Radar (docs/PLANO-V2.md, secções 3 e 6). As contas fazem-se com valores exatos;
// arredonda-se a 2 casas, com ,5 para cima, só para comparar e para mostrar.

const NIVEL_PRECOS = "PA.NUS.PPPC.RF";
const PESOS_EVIDENCIA = { escala: 25, profundidade: 30, duracao: 20 };

/** A evidência de uma ação: o IIS sem a necessidade (os pesos do Equilibrado reescalados), exata. */
export function evidencia(acao: ImpactoAcao): number {
  const w = PESOS_EVIDENCIA;
  return (
    (w.escala * acao.escala.percentil +
      w.profundidade * acao.profundidade.percentil +
      w.duracao * acao.duracao.percentil) /
    (w.escala + w.profundidade + w.duracao)
  );
}

/** A mediana das evidências das ações, exata. */
export function medianaEvidencia(acoes: ImpactoAcao[]): number {
  const v = acoes.map(evidencia).sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

/** O quadrante: necessidade alta acima do percentil 50; evidência alta acima da mediana. */
export function classificar(
  necessidade: number | null,
  evidenciaDaCelula: number,
  mediana: number,
): Quadrante | null {
  if (necessidade === null) return null;
  const precisa = arredondar(necessidade, 2) > 50;
  const funciona = arredondar(evidenciaDaCelula, 2) > arredondar(mediana, 2);
  if (precisa) return funciona ? "Reforçar" : "Repensar ou apoiar";
  return funciona ? "Manter" : "Reavaliar";
}

export type GruposRadar = Record<Quadrante | "semDado", RadarCelula[]>;

/** As células de uma área (ou de todas) por quadrante, da maior necessidade para a menor. */
export function quadrante(celulas: RadarCelula[], area?: string): GruposRadar {
  const grupos: GruposRadar = {
    Reforçar: [],
    "Repensar ou apoiar": [],
    Manter: [],
    Reavaliar: [],
    semDado: [],
  };
  for (const c of celulas)
    if (!area || c.area === area) grupos[c.quadrante ?? "semDado"].push(c);
  for (const lista of Object.values(grupos))
    lista.sort(
      (a, b) =>
        (b.necessidadePercentil ?? -1) - (a.necessidadePercentil ?? -1) ||
        a.pais.localeCompare(b.pais),
    );
  return grupos;
}

/** O custo por beneficiário de uma área sem o nível de preços: a mediana das ações da área, exata. */
export function custoBaseArea(
  acoes: Acao[],
  contexto: Contexto[],
  area: string,
): number | null {
  const nivel = new Map(
    contexto.map((c) => [c.pais, c.indicadores[NIVEL_PRECOS]?.valor ?? null]),
  );
  const v = acoes
    .filter((a) => a.area === area && nivel.get(a.pais))
    .map((a) => a.custoPorPessoa.valor / (nivel.get(a.pais) as number))
    .sort((a, b) => a - b);
  if (!v.length) return null;
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
}

export type EntradaNovoProjeto = {
  pais: string;
  area: string;
  formato: string;
  orcamento: number;
};

export type Leitura =
  | "avançar"
  | "pilotar"
  | "rever"
  | "confirmar a necessidade";

export type NovoProjeto = {
  /** exato; mostra-se arredondado */
  custoPorBeneficiario: number;
  /** beneficiários contados como nos relatórios mensais, exato */
  alcance: number;
  quadrante: Quadrante | null;
  leitura: Leitura;
  /** o motivo, numa frase */
  motivo: string;
  /** o formato, o orçamento e o alcance, numa frase */
  resumo: string;
  estimado: boolean;
  n: number;
  /** a ação que já existe na célula, se houver */
  projeto: string | null;
};

const LEITURA: Record<Quadrante, Leitura> = {
  Reforçar: "avançar",
  "Repensar ou apoiar": "pilotar",
  Manter: "rever",
  Reavaliar: "rever",
};

const PILOTAR = "Pilotar, com uma avaliação antes e depois";

/**
 * Protótipo: um projeto novo num país e numa área.
 * - Custo por beneficiário: com uma ação na célula, o dessa ação (sem ajuste de preços); nas outras,
 *   o da área sem o nível de preços (a mediana das ações) vezes o nível de preços do país escolhido.
 * - Alcance: o orçamento a dividir por esse custo, em beneficiários contados como nos relatórios mensais.
 * - Leitura: Reforçar → avançar; Repensar ou apoiar → pilotar; Manter ou Reavaliar → rever; sem dado
 *   da necessidade → confirmar a necessidade. «Avançar» desce a «pilotar» nas células estimadas com
 *   uma só ação por trás e nas células com uma ação de confiança baixa.
 */
export function novoProjeto(
  entrada: EntradaNovoProjeto,
  dados: { acoes: Acao[]; contexto: Contexto[]; celulas: RadarCelula[] },
): NovoProjeto | null {
  const { pais, area, formato, orcamento } = entrada;
  const celula = dados.celulas.find((c) => c.pais === pais && c.area === area);
  if (!celula) return null;
  const acao = celula.estimado
    ? undefined
    : dados.acoes.find((a) => a.pais === pais && a.area === area);

  let custo: number;
  if (acao) custo = acao.custoPorPessoa.valor;
  else {
    const base = custoBaseArea(dados.acoes, dados.contexto, area);
    const nivel = dados.contexto.find((c) => c.pais === pais)?.indicadores[
      NIVEL_PRECOS
    ]?.valor;
    if (base === null || !nivel) return null;
    custo = base * nivel;
  }
  const alcance = orcamento / custo;

  let leitura: Leitura = celula.quadrante
    ? LEITURA[celula.quadrante]
    : "confirmar a necessidade";
  const umaSo = celula.estimado && celula.n === 1;
  const poucaConfianca = acao?.confianca === "baixa";
  if (leitura === "avançar" && (umaSo || poucaConfianca)) leitura = "pilotar";

  const onde = `${nomeArea(area)} ${emPais(pais)}`;
  const metade =
    celula.necessidadePercentil !== null &&
    arredondar(celula.necessidadePercentil, 2) > 50
      ? "na metade mais alta dos 12 países"
      : "na metade mais baixa dos 12 países";
  const existe = acao ? `já existe o ${acao.projeto} aqui` : null;
  const noutros =
    celula.n === 1
      ? "a ação desta área noutro país"
      : "as ações desta área noutros países";

  let motivo: string;
  if (celula.quadrante === null)
    motivo =
      "Confirmar a necessidade: falta o indicador para este país; confirmar com dados locais antes de decidir.";
  else if (celula.quadrante === "Reforçar")
    motivo =
      leitura === "avançar"
        ? existe
          ? `Avançar: ${existe} e dá resultados acima da mediana das 12 ações, e a necessidade de ${onde} está ${metade}.`
          : `Avançar: a necessidade de ${onde} está ${metade} e ${noutros} dão resultados acima da mediana.`
        : existe
          ? `${PILOTAR}: ${existe} e dá resultados acima da mediana, e a necessidade de ${onde} está ${metade}, mas a confiança nos números dessa ação é baixa.`
          : `${PILOTAR}: a necessidade de ${onde} está ${metade} e ${noutros} dá resultados acima da mediana, mas é uma só ação.`;
  else if (celula.quadrante === "Repensar ou apoiar")
    motivo = existe
      ? `${PILOTAR}: ${existe}, mas dá resultados abaixo da mediana, e a necessidade de ${onde} está ${metade}.`
      : `${PILOTAR}: a necessidade de ${onde} está ${metade}, mas ${noutros} ${celula.n === 1 ? "dá" : "dão"} resultados abaixo da mediana.`;
  else if (celula.quadrante === "Manter")
    motivo = `Rever: ${existe ? `${existe} e ` : ""}as ações desta área dão resultados, mas aqui a necessidade está na metade mais baixa dos 12 países: há sítios onde faria mais diferença.`;
  else
    motivo = existe
      ? `Rever: ${existe} e dá resultados abaixo da mediana, e a necessidade de ${onde} está ${metade}.`
      : `Rever: a necessidade de ${onde} está ${metade} e ${noutros} ${celula.n === 1 ? "dá" : "dão"} resultados abaixo da mediana.`;

  return {
    custoPorBeneficiario: custo,
    alcance,
    quadrante: celula.quadrante,
    leitura,
    motivo,
    resumo: `Um projeto de ${formato} com ${euros(orcamento, 0)} chega a cerca de ${numero(arredondar(alcance, 0))} beneficiários, contados como nos relatórios mensais, a ${euros(arredondar(custo, 0), 0)} cada.`,
    estimado: celula.estimado,
    n: celula.n,
    projeto: acao?.projeto ?? null,
  };
}

/**
 * «Onde faria mais diferença»: as células Reforçar que ainda não têm ação (estimadas),
 * da maior necessidade para a menor; num empate, por área e por país.
 */
export function ondeFariaDiferenca(
  celulas: RadarCelula[],
  quantas = 5,
): RadarCelula[] {
  return celulas
    .filter((c) => c.quadrante === "Reforçar" && c.estimado)
    .sort(
      (a, b) =>
        arredondar(b.necessidadePercentil ?? 0, 2) -
          arredondar(a.necessidadePercentil ?? 0, 2) ||
        a.area.localeCompare(b.area) ||
        a.pais.localeCompare(b.pais),
    )
    .slice(0, quantas);
}

/** A posição do país na necessidade da área (1 = mais necessidade) e quantos países têm dado. */
export function posicaoNecessidade(
  celulas: RadarCelula[],
  celula: RadarCelula,
): { posicao: number; comDado: number } | null {
  if (celula.necessidadePercentil === null) return null;
  const daArea = celulas.filter(
    (c) => c.area === celula.area && c.necessidadePercentil !== null,
  );
  const minha = arredondar(celula.necessidadePercentil, 2);
  return {
    posicao:
      daArea.filter((c) => arredondar(c.necessidadePercentil ?? 0, 2) > minha)
        .length + 1,
    comDado: daArea.length,
  };
}
