import type { Contexto, ImpactoAcao } from "@/types";

// DADOS DE EXEMPLO do Início, com os tipos de public/data (docs/PLANO-V2.md, secção 6).
// Saem quando o Início ler o impacto.json com as funções do Dan (alcancePortefolio).
// Os países e as capitais são os do contexto.json; os nomes, os valores e os pontos são inventados.

/** Os nomes de exemplo, no lugar do projetos.json. */
export type ProjetoExemplo = {
  id: string;
  nome: string;
  pais: string;
  area: string;
};

export const PROJETOS_EXEMPLO: ProjetoExemplo[] = [
  { id: "P01", nome: "Ação de exemplo 1", pais: "Brasil", area: "educacao" },
  { id: "P02", nome: "Ação de exemplo 2", pais: "Quenia", area: "saude" },
  { id: "P03", nome: "Ação de exemplo 3", pais: "India", area: "formacao" },
  {
    id: "P04",
    nome: "Ação de exemplo 4",
    pais: "Portugal",
    area: "tecnologia",
  },
  { id: "P05", nome: "Ação de exemplo 5", pais: "Ghana", area: "saude" },
  { id: "P06", nome: "Ação de exemplo 6", pais: "Peru", area: "educacao" },
  { id: "P07", nome: "Ação de exemplo 7", pais: "Senegal", area: "formacao" },
  { id: "P08", nome: "Ação de exemplo 8", pais: "Bangladesh", area: "saude" },
  { id: "P09", nome: "Ação de exemplo 9", pais: "Colombia", area: "educacao" },
  {
    id: "P10",
    nome: "Ação de exemplo 10",
    pais: "Filipinas",
    area: "logistica",
  },
  { id: "P11", nome: "Ação de exemplo 11", pais: "Uganda", area: "formacao" },
  { id: "P12", nome: "Ação de exemplo 12", pais: "Mocambique", area: "saude" },
];

const pais = (
  nome: string,
  iso3: string,
  regiao: Contexto["regiao"],
  lat: number,
  lng: number,
): Contexto => ({ pais: nome, iso3, regiao, lat, lng, indicadores: {} });

export const CONTEXTO_EXEMPLO: Contexto[] = [
  pais("Brasil", "BRA", "América do Sul", -15.7801, -47.9292),
  pais("Quenia", "KEN", "África", -1.27975, 36.8126),
  pais("India", "IND", "Ásia", 28.6353, 77.225),
  pais("Portugal", "PRT", "Europa", 38.7072, -9.13552),
  pais("Ghana", "GHA", "África", 5.57045, -0.20795),
  pais("Peru", "PER", "América do Sul", -12.0931, -77.0465),
  pais("Senegal", "SEN", "África", 14.7247, -17.4734),
  pais("Bangladesh", "BGD", "Ásia", 23.7055, 90.4113),
  pais("Colombia", "COL", "América do Sul", 4.60987, -74.082),
  pais("Filipinas", "PHL", "Ásia", 14.5515, 121.035),
  pais("Uganda", "UGA", "África", 0.314269, 32.5729),
  pais("Mocambique", "MOZ", "África", -25.9664, 32.5713),
];

const LENTE = { nivel: "a acompanhar", frase: "Exemplo." } as const;
const SAUDE: ImpactoAcao["saude"] = {
  relevancia: LENTE,
  eficacia: LENTE,
  eficiencia: LENTE,
  impacto: LENTE,
  sustentabilidade: LENTE,
};

/** Uma ação de exemplo: os percentis das 4 dimensões, os beneficiários por mês e os pontos a confirmar. */
function acao(
  projeto: string,
  [necessidade, escala, profundidade, duracao]: [
    number | null,
    number,
    number,
    number,
  ],
  beneficiariosPorMes: number,
  pontos: string[] = [],
): ImpactoAcao {
  return {
    projeto,
    necessidade: {
      indicador: "exemplo",
      valor: null,
      ano: null,
      percentil: necessidade,
    },
    escala: { beneficiariosPorMes, percentil: escala },
    profundidade: {
      taxaConclusao: 0,
      horasFormacaoPorBenef: 0,
      percentil: profundidade,
    },
    jovensFormados: { total: 0, porMes: 0 },
    duracao: { crescimento: 0, percentil: duracao },
    custoPorPessoa: { valor: 0, percentilInvertido: 0 },
    confianca:
      pontos.length >= 2 ? "baixa" : pontos.length === 1 ? "média" : "alta",
    pontos: pontos.map((texto, i) => ({ id: `exemplo${i + 1}`, texto })),
    saude: SAUDE,
  };
}

export const IMPACTO_EXEMPLO: ImpactoAcao[] = [
  acao("P01", [30, 100, 20, 80], 150, [
    "confirmar o custo por atividade, 4 vezes o das outras ações de educação.",
    "pedir a referência de 12 correções de despesa.",
  ]),
  acao("P02", [65, 55, 60, 50], 59, [
    "confirmar as presenças de novembro e dezembro, que sobem mais do que no resto do portefólio.",
  ]),
  acao("P03", [50, 45, 35, 40], 51, [
    "confirmar o objetivo: diz saúde preventiva, mas a área é a formação.",
    "pedir a referência de 8 correções de despesa.",
  ]),
  acao("P04", [8, 25, 55, 30], 34),
  acao("P05", [75, 70, 65, 70], 79),
  acao("P06", [85, 15, 40, 20], 26, [
    "confirmar os participantes por atividade, que caíram para metade em 2025.",
  ]),
  acao("P07", [70, 30, 90, 60], 29),
  acao("P08", [75, 60, 50, 90], 55),
  acao("P09", [17, 35, 30, 10], 39),
  acao("P10", [100, 90, 85, 100], 102),
  acao("P11", [92, 10, 75, 45], 22),
  acao("P12", [92, 65, 45, 65], 67),
];

/** O fim de ano de exemplo: quanto sobem, por mês, os beneficiários e a despesa em novembro e dezembro. */
export const FIM_DE_ANO_EXEMPLO = { beneficiarios: 0.38, despesa: 0.02 };
