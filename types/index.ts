// Os tipos dos ficheiros de public/data (docs/SPEC.md, secção 2) e dos resultados de lib/.

/** Uma linha de mensal.json: um projeto num mês. */
export type Mes = {
  projeto: string;
  /** "AAAA-MM" */
  mes: string;
  /** novembro e dezembro */
  fimDeAno: boolean;
  /** euros, líquida dos estornos */
  despesa: number;
  /** euros, ≥ 0 */
  estornos: number;
  atividades: number;
  participantes: number;
  horasAtividade: number;
  horasVoluntariado: number;
  voluntariosRegistados: number;
  beneficiarios: number;
  jovensFormados: number;
  horasFormacao: number;
  oficinas: number;
  /** percentagem: média, nunca soma */
  taxaConclusao: number;
  /** métrica dos parceiros: só para o aviso */
  voluntariosReportados: number;
  reunioes: number;
  horasReuniao: number;
};

export type Parceiro = {
  id: string;
  especialidade: string;
  historico: string;
  capacidade: number;
};

/** Uma linha de projetos.json. */
export type Projeto = {
  id: string;
  nome: string;
  pais: string;
  regiao: string;
  area: string;
  anoInicio: number;
  orcamentoAnual: number;
  estado: "ativo" | "em_avaliacao";
  objetivos: string;
  parceiro: Parceiro;
  voluntariosDistintos: number;
  /** % de alocações com a competência da área */
  competenciaCerta: number;
  investimentoAprovado: number;
  investimentoProposto: number;
};

/** Uma linha de planos.json. */
export type Plano = {
  id: string;
  projeto: string;
  data: string;
  tipo: string;
  valor: number;
  estado: string;
  descricao: string;
};

export type Limpeza = {
  id: string;
  titulo: string;
  quantidade: number;
  de: number;
  regra: string;
  impacto?: string;
  valor?: number;
  horas?: number;
};

export type Anomalia = {
  id: "fimDeAno" | "dia27" | "semana" | "voluntarios";
  titulo: string;
  texto: string;
  numeros: Record<string, unknown>;
};

export type NotaScorecard = {
  dimensao: string;
  nota: 1 | 2 | 3 | 4 | 5;
  evidencia: string;
};

/** qualidade.json. */
export type Qualidade = {
  referencia: string;
  limpeza: Limpeza[];
  anomalias: Anomalia[];
  notaGenerica: { ferramenta: string; resultado: string };
  scorecard: NotaScorecard[];
};

/** Os ficheiros de public/data, carregados juntos. */
export type Dados = {
  mensal: Mes[];
  projetos: Projeto[];
  planos: Plano[];
  qualidade: Qualidade;
  impacto: ImpactoAcao[];
  contexto: Contexto[];
  radar: RadarCelula[];
};

// ---- Resultados de lib/ (docs/SPEC.md, secção 3) ----

/** euro: custo por beneficiário; jovem: custo por jovem formado. */
export type Unidade = "euro" | "jovem";

export type LinhaEficiencia = {
  projeto: string;
  valor: number;
  /** 1 é o melhor */
  posicao: number;
};

export type Totais = {
  despesa: number;
  beneficiarios: number;
  horasVoluntariado: number;
  custoPorBeneficiario: number;
};

export type Subida = { janOut: number; novDez: number; subida: number };

export type FimDeAno = {
  atividadesPorMes: Subida;
  beneficiariosPorMes: Subida;
  despesaPorMes: Subida;
  custoPorBeneficiario: { janOut: number; novDez: number };
};

export type EntradaSimulacao = {
  /** custo por beneficiário de cada projeto, em meses comparáveis */
  custos: Record<string, number>;
  /** investimento aprovado de cada projeto */
  investimento: Record<string, number>;
  /** quem dá */
  de: string[];
  /** quem recebe, em partes iguais */
  para: string[];
  /** a parte movida, de 0 a 1 */
  fracao: number;
  /** quanto mais custa um beneficiário a mais (1,2 = +20%) */
  fator: number;
  /** o custo médio de um beneficiário em meses comparáveis */
  custoMedio: number;
};

export type Simulacao = {
  movido: number;
  perdidos: number;
  ganhos: number;
  saldo: number;
  saldoPorAno: number;
  valorEquivalentePorAno: number;
};

export type Grafia = { coluna: string; variantes: string[] };

export type ResultadoAuditoria = {
  linhas: number;
  datas?: { iso: number; ddmm: number; outro: number };
  dias28a31?: number;
  diaMaximo?: number;
  /** % de datas a um domingo, com 2 casas decimais */
  domingo?: number;
  picos?: string[];
  negativos?: number;
  idsRepetidos?: number;
  linhasIguais: number;
  refsInvalidas?: number;
  grafias: Grafia[];
  vazios: Record<string, number>;
};

/** O «porquê» do ecrã 2 e os estornos de um projeto. */
export type ResumoProjeto = {
  /** euros por atividade */
  custoPorAtividade: number;
  /** horas de reunião por 100 horas de atividade */
  reunioesPor100hAtividade: number;
  /** euros abatidos */
  estornos: number;
};

// ---- Dados do mundo (docs/PLANO-V2.md, secção 6) ----

export type Regiao = "África" | "América do Sul" | "Ásia" | "Europa";

/** Um indicador do Banco Mundial: o valor mais recente e o ano; null quando não há. */
export type IndicadorContexto = {
  valor: number | null;
  ano: number | null;
  fonte: string;
};

/** Uma linha de public/data/contexto.json: um país, com a capital e os indicadores. */
export type Contexto = {
  pais: string;
  iso3: string;
  regiao: Regiao;
  lat: number;
  lng: number;
  indicadores: Record<string, IndicadorContexto>;
};

export type NivelSaude = "forte" | "a acompanhar" | "a rever";

/** Uma linha de public/data/impacto.json: uma ação, com as dimensões do IIS (docs/PLANO-V2.md, secção 6). */
export type ImpactoAcao = {
  projeto: string;
  necessidade: {
    indicador: string;
    valor: number | null;
    ano: number | null;
    percentil: number | null;
  };
  escala: { beneficiariosPorMes: number; percentil: number };
  profundidade: {
    taxaConclusao: number;
    horasFormacaoPorBenef: number;
    percentil: number;
  };
  /** um resultado à parte, fora do índice: os jovens formados contam outra população */
  jovensFormados: { total: number; porMes: number };
  duracao: { crescimento: number; percentil: number };
  custoPorPessoa: { valor: number; percentilInvertido: number };
  confianca: "alta" | "média" | "baixa";
  pontos: { id: string; texto: string }[];
  saude: Record<
    "relevancia" | "eficacia" | "eficiencia" | "impacto" | "sustentabilidade",
    { nivel: NivelSaude; frase: string }
  >;
};

export type Quadrante =
  | "Reforçar"
  | "Repensar ou apoiar"
  | "Manter"
  | "Reavaliar";

/** Uma linha de public/data/radar.json: um país e uma área (docs/PLANO-V2.md, secção 6). */
export type RadarCelula = {
  pais: string;
  area: string;
  /** null quando o país não tem o indicador da área: o ecrã diz «sem dado» */
  necessidadePercentil: number | null;
  /** exata: o IIS sem a necessidade */
  evidencia: number;
  /** a evidência vem da mesma área noutros países */
  estimado: boolean;
  /** quantas ações estão por trás da evidência */
  n: number;
  quadrante: Quadrante | null;
};
