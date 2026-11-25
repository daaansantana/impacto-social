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

/** Os quatro ficheiros, carregados juntos. */
export type Dados = {
  mensal: Mes[];
  projetos: Projeto[];
  planos: Plano[];
  qualidade: Qualidade;
};

// ---- Resultados de lib/ (docs/SPEC.md, secção 3) ----

/** euro: custo por beneficiário; hora: beneficiários por 1000 horas; jovem: custo por jovem formado. */
export type Unidade = "euro" | "hora" | "jovem";

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
