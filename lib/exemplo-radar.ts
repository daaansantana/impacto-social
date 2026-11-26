import type { Quadrante, RadarCelula } from "@/types";

// DADOS DE EXEMPLO do Radar, com os tipos de public/data/radar.json (docs/PLANO-V2.md, secção 6).
// Saem quando este ramo tiver o radar.json e o lib/radar.ts do Dan (quadrante e novoProjeto, no main).
// Os países, as áreas e onde há ações são os reais; a necessidade e a evidência são inventadas.

export const AREAS_RADAR = [
  "educacao",
  "formacao",
  "saude",
  "tecnologia",
  "logistica",
  "comunicacao",
] as const;

const PAISES = [
  "Brasil",
  "Quenia",
  "India",
  "Portugal",
  "Ghana",
  "Peru",
  "Senegal",
  "Bangladesh",
  "Colombia",
  "Filipinas",
  "Uganda",
  "Mocambique",
];

/** Onde há ações, por área (como em projetos.json), com uma evidência de exemplo. */
const ACOES: Record<string, Record<string, number>> = {
  educacao: { Brasil: 64, Senegal: 58, Filipinas: 71 },
  formacao: { Quenia: 52, Peru: 38 },
  saude: { India: 44, Colombia: 61 },
  tecnologia: { Portugal: 47, Mocambique: 66 },
  logistica: { Ghana: 41, Uganda: 69 },
  comunicacao: { Bangladesh: 55 },
};

/** Onde falta o indicador da necessidade (o ecrã diz «Sem dado»). */
const SEM_INDICADOR = new Set(["Portugal|educacao", "Uganda|formacao"]);

/** A mediana das evidências das 12 ações de exemplo: o limite da evidência alta. */
export const LIMITE_EVIDENCIA_EXEMPLO = 56.5;

/** O quadrante, com as regras do classificar do Dan: necessidade alta acima de 50, evidência alta acima da mediana. */
export function classificarExemplo(
  necessidade: number | null,
  evidencia: number,
  limite: number,
): Quadrante | null {
  if (necessidade === null) return null;
  if (necessidade > 50)
    return evidencia > limite ? "Reforçar" : "Repensar ou apoiar";
  return evidencia > limite ? "Manter" : "Reavaliar";
}

function celulas(): RadarCelula[] {
  const lista: RadarCelula[] = [];
  AREAS_RADAR.forEach((area, a) => {
    const acoes = ACOES[area];
    const comAcao = Object.values(acoes);
    const media = comAcao.reduce((s, v) => s + v, 0) / comAcao.length;
    PAISES.forEach((pais, i) => {
      // uma necessidade de exemplo estável, de 0 a 100, que muda de país para país e de área para área
      const necessidade = SEM_INDICADOR.has(`${pais}|${area}`)
        ? null
        : Math.round(((i * 41 + a * 17 + 13) % 97) * (100 / 96));
      const real = acoes[pais];
      const evidencia = real ?? media;
      lista.push({
        pais,
        area,
        necessidadePercentil: necessidade,
        evidencia,
        estimado: real === undefined,
        n: real === undefined ? comAcao.length : 1,
        quadrante: classificarExemplo(
          necessidade,
          evidencia,
          LIMITE_EVIDENCIA_EXEMPLO,
        ),
      });
    });
  });
  return lista;
}

export const RADAR_EXEMPLO: RadarCelula[] = celulas();

// ---- Novo projeto (protótipo), com os tipos do novoProjeto do Dan ----

export type EntradaNovoProjeto = {
  pais: string;
  area: string;
  formato: string;
  orcamento: number;
};

export type LeituraNovoProjeto =
  | "avançar"
  | "pilotar"
  | "rever"
  | "confirmar a necessidade";

export type NovoProjeto = {
  custoPorBeneficiario: number;
  alcance: number;
  quadrante: Quadrante | null;
  leitura: LeituraNovoProjeto;
  motivo: string;
  resumo: string;
  estimado: boolean;
  n: number;
  projeto: string | null;
};

/** O custo por beneficiário de exemplo, por área (euros). */
const CUSTO_EXEMPLO: Record<string, number> = {
  educacao: 2400,
  formacao: 2100,
  saude: 1900,
  tecnologia: 1950,
  logistica: 1850,
  comunicacao: 2000,
};

const LEITURA: Record<Quadrante, LeituraNovoProjeto> = {
  Reforçar: "avançar",
  "Repensar ou apoiar": "pilotar",
  Manter: "rever",
  Reavaliar: "rever",
};

/** Um novo projeto de exemplo: o orçamento a dividir pelo custo da área e a leitura do quadrante. */
export function novoProjetoExemplo(
  entrada: EntradaNovoProjeto,
  dados: { celulas: RadarCelula[] },
): NovoProjeto | null {
  const celula = dados.celulas.find(
    (c) => c.pais === entrada.pais && c.area === entrada.area,
  );
  const custo = CUSTO_EXEMPLO[entrada.area];
  if (!celula || !custo || !(entrada.orcamento > 0)) return null;
  let leitura: LeituraNovoProjeto = celula.quadrante
    ? LEITURA[celula.quadrante]
    : "confirmar a necessidade";
  if (leitura === "avançar" && celula.estimado && celula.n === 1)
    leitura = "pilotar";
  return {
    custoPorBeneficiario: custo,
    alcance: entrada.orcamento / custo,
    quadrante: celula.quadrante,
    leitura,
    motivo:
      celula.quadrante === null
        ? "Falta o indicador da necessidade para este país."
        : `A célula está em «${celula.quadrante}».`,
    resumo: `Um projeto de ${entrada.formato} com ${entrada.orcamento} € (exemplo).`,
    estimado: celula.estimado,
    n: celula.n,
    projeto: null,
  };
}

/** As células por quadrante, como o quadrante do Dan: da maior necessidade para a menor. */
export type GruposRadar = Record<Quadrante | "semDado", RadarCelula[]>;

export function quadranteExemplo(
  celulasRadar: RadarCelula[],
  area?: string,
): GruposRadar {
  const grupos: GruposRadar = {
    Reforçar: [],
    "Repensar ou apoiar": [],
    Manter: [],
    Reavaliar: [],
    semDado: [],
  };
  for (const c of celulasRadar)
    if (!area || c.area === area) grupos[c.quadrante ?? "semDado"].push(c);
  for (const lista of Object.values(grupos))
    lista.sort(
      (a, b) =>
        (b.necessidadePercentil ?? -1) - (a.necessidadePercentil ?? -1) ||
        a.pais.localeCompare(b.pais),
    );
  return grupos;
}
