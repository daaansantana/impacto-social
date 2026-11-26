import { juntarAcoes } from "@/lib/acoes";
import { numero, percentagem } from "@/lib/format";
import {
  type Dimensao,
  type Pesos,
  PREDEFINICOES,
  type Predefinicao,
  rankingIIS,
} from "@/lib/iis";
import { type Local, local, nomeArea, nomePais } from "@/lib/nomes";
import { construirConfianca, type VistaConfianca } from "@/lib/vista-confianca";
import type { Dados } from "@/types";

// O ecrã Como medimos (docs/PLANO-V2.md, secções 2 e 8, prompt A6). É o único sítio onde se diz «percentil».

export const NOTA_INDICE =
  "Índice nosso, inspirado nas 5 dimensões do impacto. Os pesos são uma escolha, e pode mudá-los.";

export const DIMENSOES: { id: Dimensao; titulo: string }[] = [
  { id: "necessidade", titulo: "Necessidade" },
  { id: "escala", titulo: "Escala" },
  { id: "profundidade", titulo: "Profundidade" },
  { id: "duracao", titulo: "Duração" },
];

export const DEFINICOES: { titulo: string; pergunta: string; texto: string }[] =
  [
    {
      titulo: "Necessidade (quem)",
      pergunta: "As pessoas a quem chegamos precisam mesmo?",
      texto:
        "Um indicador do Banco Mundial para a área do projeto, no país do projeto, em percentil entre os países com dado (a tabela ao lado).",
    },
    {
      titulo: "Escala (quanto)",
      pergunta: "A quantas pessoas chegamos?",
      texto:
        "Os beneficiários por mês, de janeiro a outubro, em percentil entre as 12 ações.",
    },
    {
      titulo: "Profundidade (quanto)",
      pergunta: "Quanto muda para cada pessoa?",
      texto:
        "A média dos percentis da taxa de conclusão e das horas de formação por beneficiário. Os jovens formados ficam à parte, fora do índice: contam outra população.",
    },
    {
      titulo: "Duração (quanto)",
      pergunta: "O impacto mantém-se?",
      texto:
        "O crescimento dos beneficiários de um ano para o outro, de janeiro a outubro, em percentil.",
    },
    {
      titulo: "Contributo",
      pergunta: "O que teria acontecido sem nós?",
      texto:
        "Ainda não se pode medir: precisa de uma linha de base ou de um grupo de comparação. Fica no roadmap, com peso 0.",
    },
    {
      titulo: "Risco: a confiança na medição",
      pergunta: "Qual é a probabilidade de o impacto não ser o que parece?",
      texto:
        "Não entra na conta. Os pontos de atenção próprios de cada ação dão a confiança: alta sem nenhum, média com 1 e baixa com 2 ou mais. O pico de fim de ano e o dia 27 são comuns a todas e ficam aqui em baixo.",
    },
  ];

export const CONTA = [
  "Percentil: a posição de 0 a 100 entre as 12 ações (na necessidade, entre os países com dado). 100 é a mais alta; as contas fazem-se com os valores exatos.",
  "IIS = Σ (peso × percentil) ÷ Σ pesos, de 0 a 100, arredondado no fim. Uma dimensão sem dado sai da conta só para essa ação.",
  "Todos os números são de janeiro a outubro, os meses comparáveis: novembro e dezembro ficam de fora por causa do pico de fim de ano.",
];

export const NECESSIDADE_POR_AREA: {
  area: string;
  indicador: string;
  codigo: string;
  sentido: string;
}[] = [
  {
    area: "Educação",
    indicador:
      "Pobreza de aprendizagem (crianças que aos 10 anos não leem um texto simples)",
    codigo: "SE.LPV.PRIM",
    sentido: "mais necessidade quando sobe",
  },
  {
    area: "Formação",
    indicador: "Jovens que não estudam, não trabalham nem estão em formação",
    codigo: "SL.UEM.NEET.ZS",
    sentido: "mais necessidade quando sobe",
  },
  {
    area: "Saúde",
    indicador: "Mortalidade antes dos 5 anos, por 1000 nascidos vivos",
    codigo: "SH.DYN.MORT",
    sentido: "mais necessidade quando sobe",
  },
  {
    area: "Tecnologia e comunicação",
    indicador: "Pessoas que usam a internet",
    codigo: "IT.NET.USER.ZS",
    sentido: "mais necessidade quando desce",
  },
  {
    area: "Logística",
    indicador: "Pobreza extrema",
    codigo: "SI.POV.DDAY",
    sentido: "mais necessidade quando sobe",
  },
];

export const FONTES: { nome: string; url: string; uso: string }[] = [
  {
    nome: "Impact Frontiers: as 5 dimensões do impacto",
    url: "https://impactfrontiers.org/norms/five-dimensions-of-impact/",
    uso: "As dimensões do índice: o quê, quem, quanto, contributo e risco.",
  },
  {
    nome: "OCDE: os critérios de avaliação",
    url: "https://www.oecd.org/en/publications/applying-evaluation-criteria-thoughtfully_543e84ed-en.html",
    uso: "As 5 lentes da saúde da ação: relevância, eficácia, eficiência, impacto e sustentabilidade.",
  },
  {
    nome: "Banco Mundial: World Development Indicators",
    url: "https://databank.worldbank.org/source/world-development-indicators",
    uso: "Os indicadores da necessidade e o nível de preços de cada país.",
  },
  {
    nome: "Banco Mundial: a pobreza de aprendizagem",
    url: "https://www.worldbank.org/en/topic/education/brief/what-is-learning-poverty",
    uso: "O indicador da necessidade na educação.",
  },
];

export type LinhaRanking = {
  posicao: number;
  id: string;
  nome: string;
  onde: string;
  local: Local | null;
  /** a 2 casas, para a barra */
  iis: number;
  iisTexto: string;
};

export type VistaComoMedimos = {
  predefinicao: Predefinicao | null;
  /** o peso de cada dimensão em percentagem do total, para mostrar */
  partes: Record<Dimensao, string>;
  semPesos: boolean;
  ranking: LinhaRanking[];
  confianca: VistaConfianca;
};

/** A predefinição com estes pesos, ou null se foram mudados à mão. */
export function predefinicaoDe(pesos: Pesos): Predefinicao | null {
  return (
    (Object.keys(PREDEFINICOES) as Predefinicao[]).find((p) =>
      DIMENSOES.every(({ id }) => PREDEFINICOES[p].pesos[id] === pesos[id]),
    ) ?? null
  );
}

/** O ecrã Como medimos: o ranking ao vivo com os pesos escolhidos, e a confiança nos dados. */
export function construirComoMedimos(
  dados: Pick<Dados, "impacto" | "projetos" | "contexto" | "qualidade">,
  pesos: Pesos,
): VistaComoMedimos {
  const total = DIMENSOES.reduce((s, d) => s + pesos[d.id], 0);
  const acoes = juntarAcoes(dados.impacto, dados.projetos, dados.contexto);
  const porId = new Map(acoes.map((a) => [a.projeto, a]));
  return {
    predefinicao: predefinicaoDe(pesos),
    partes: Object.fromEntries(
      DIMENSOES.map(({ id }) => [
        id,
        total ? percentagem((pesos[id] / total) * 100) : "0%",
      ]),
    ) as Record<Dimensao, string>,
    semPesos: total === 0,
    ranking: total
      ? rankingIIS(dados.impacto, pesos).map((l) => {
          const a = porId.get(l.projeto);
          return {
            posicao: l.posicao,
            id: l.projeto,
            nome: a?.nome ?? l.projeto,
            onde: a ? `${nomePais(a.pais)}, ${nomeArea(a.area)}` : "",
            local: a ? local(a.pais, a.area) : null,
            iis: l.iis,
            iisTexto: numero(l.iis),
          };
        })
      : [],
    confianca: construirConfianca(dados.qualidade),
  };
}
