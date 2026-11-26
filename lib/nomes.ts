// Os dados vêm sem acentos; no ecrã os nomes levam-nos.

const PAISES: Record<string, string> = {
  Quenia: "Quénia",
  India: "Índia",
  Ghana: "Gana",
  Colombia: "Colômbia",
  Mocambique: "Moçambique",
};

const AREAS: Record<string, string> = {
  educacao: "educação",
  formacao: "formação",
  saude: "saúde",
  tecnologia: "tecnologia",
  logistica: "logística",
  comunicacao: "comunicação",
};

export const nomePais = (pais: string) => PAISES[pais] ?? pais;
export const nomeArea = (area: string) =>
  AREAS[area] ?? area.replaceAll("_", " ");

const EM: Record<string, string> = {
  Brasil: "no Brasil",
  Quenia: "no Quénia",
  India: "na Índia",
  Portugal: "em Portugal",
  Ghana: "no Gana",
  Peru: "no Peru",
  Senegal: "no Senegal",
  Bangladesh: "no Bangladesh",
  Colombia: "na Colômbia",
  Filipinas: "nas Filipinas",
  Uganda: "no Uganda",
  Mocambique: "em Moçambique",
};

/** «no Senegal», «na Índia», «em Portugal». */
export const emPais = (pais: string) => EM[pais] ?? `em ${nomePais(pais)}`;

const ATIVIDADES: Record<string, string> = {
  "oficina educativa": "oficina educativa",
  aula: "aula",
  "apoio estudo": "apoio ao estudo",
  mentoria: "mentoria",
  "formacao profissional": "formação profissional",
  workshop: "workshop",
  acolhimento: "acolhimento",
  rastreio: "rastreio",
  "palestra saude": "palestra de saúde",
  "suporte tecnico": "suporte técnico",
  "laboratorio ti": "laboratório de informática",
  "formacao digital": "formação digital",
  distribuicao: "distribuição",
  "entrega material": "entrega de material",
  inventario: "inventário",
  "evento comunitario": "evento comunitário",
  campanha: "campanha",
  "producao material": "produção de material",
};

/** O nome de um tipo de atividade, com acentos. */
export const nomeAtividade = (tipo: string) => ATIVIDADES[tipo] ?? tipo;
