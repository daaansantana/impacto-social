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

export type Leitura = "avançar" | "pilotar" | "rever";

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
};

const LEITURA: Record<Quadrante, Leitura> = {
  Reforçar: "avançar",
  "Repensar ou apoiar": "pilotar",
  Manter: "rever",
  Reavaliar: "rever",
};

/**
 * Protótipo: um projeto novo num país e numa área. O custo é o da área sem o nível de preços,
 * vezes o nível de preços do país escolhido; o alcance é o orçamento a dividir por esse custo.
 * Com uma só ação por trás da evidência (n = 1), a leitura fica no máximo em «pilotar».
 */
export function novoProjeto(
  entrada: EntradaNovoProjeto,
  dados: { acoes: Acao[]; contexto: Contexto[]; celulas: RadarCelula[] },
): NovoProjeto | null {
  const { pais, area, formato, orcamento } = entrada;
  const base = custoBaseArea(dados.acoes, dados.contexto, area);
  const nivel = dados.contexto.find((c) => c.pais === pais)?.indicadores[
    NIVEL_PRECOS
  ]?.valor;
  const celula = dados.celulas.find((c) => c.pais === pais && c.area === area);
  if (base === null || !nivel || !celula) return null;

  const custo = base * nivel;
  const alcance = orcamento / custo;
  let leitura: Leitura = celula.quadrante ? LEITURA[celula.quadrante] : "rever";
  if (celula.n === 1 && leitura === "avançar") leitura = "pilotar";

  const onde = `${nomeArea(area)} ${emPais(pais)}`;
  const nec =
    celula.necessidadePercentil === null
      ? null
      : numero(arredondar(celula.necessidadePercentil, 2));
  const ev = numero(arredondar(celula.evidencia, 2));
  const deOnde = celula.estimado
    ? `estimada a partir de ${celula.n === 1 ? "1 ação" : `${celula.n} ações`} noutros países`
    : "da ação que já lá existe";
  const motivo =
    celula.quadrante === null
      ? `Rever: não há dado da necessidade de ${onde}, por isso não se sabe se é aqui que faz mais diferença.`
      : leitura === "avançar"
        ? `Avançar: a necessidade de ${onde} é alta (percentil ${nec}) e a evidência também (${ev}, ${deOnde}).`
        : leitura === "pilotar" && celula.quadrante === "Reforçar"
          ? `Pilotar, com uma avaliação antes e depois: a necessidade de ${onde} é alta (percentil ${nec}) e a evidência também (${ev}), mas vem de uma só ação.`
          : leitura === "pilotar"
            ? `Pilotar, com uma avaliação antes e depois: a necessidade de ${onde} é alta (percentil ${nec}), mas a evidência é baixa (${ev}, ${deOnde}).`
            : `Rever: a necessidade de ${onde} não está acima do percentil 50 (percentil ${nec}).`;
  return {
    custoPorBeneficiario: custo,
    alcance,
    quadrante: celula.quadrante,
    leitura,
    motivo,
    resumo: `Um projeto de ${formato} com ${euros(orcamento, 0)} chega a cerca de ${numero(arredondar(alcance, 0))} beneficiários, contados como nos relatórios mensais, a ${euros(arredondar(custo, 0), 0)} cada.`,
    estimado: celula.estimado,
    n: celula.n,
  };
}
