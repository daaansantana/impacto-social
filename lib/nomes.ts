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

const COM_ARTIGO: Record<string, [string, string]> = {
  Brasil: ["o Brasil", "é"],
  Quenia: ["o Quénia", "é"],
  India: ["a Índia", "é"],
  Portugal: ["Portugal", "é"],
  Ghana: ["o Gana", "é"],
  Peru: ["o Peru", "é"],
  Senegal: ["o Senegal", "é"],
  Bangladesh: ["o Bangladesh", "é"],
  Colombia: ["a Colômbia", "é"],
  Filipinas: ["as Filipinas", "são"],
  Uganda: ["o Uganda", "é"],
  Mocambique: ["Moçambique", "é"],
};

/** «o Senegal é o 4.º país com mais necessidade em educação, entre os 10 países com dado». */
export function fraseNecessidade(
  pais: string,
  area: string,
  posicao: number,
  comDado: number,
): string {
  const [nome, verbo] = COM_ARTIGO[pais] ?? [nomePais(pais), "é"];
  const lugar = posicao === 1 ? "o país" : `o ${posicao}.º país`;
  return `${nome} ${verbo} ${lugar} com mais necessidade em ${nomeArea(area)}, entre os ${comDado} países com dado`;
}

// As palavras sem acento nos tipos de atividade (atividades.json) e nos objetivos (projetos.json).
const PALAVRAS: Record<string, string> = {
  comunitario: "comunitário",
  competencias: "competências",
  conclusao: "conclusão",
  distribuicao: "distribuição",
  formacao: "formação",
  inventario: "inventário",
  laboratorio: "laboratório",
  producao: "produção",
  saude: "saúde",
  tecnico: "técnico",
  ti: "TI",
};
const acentuar = (palavra: string) => PALAVRAS[palavra] ?? palavra;

/** «formacao_profissional» → «Formação Profissional»: sem «_», com acentos e cada palavra com maiúscula. */
export const rotuloAtividade = (tipo: string) =>
  tipo
    .split("_")
    .filter(Boolean)
    .map(acentuar)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

/** «ampliar cobertura de saude preventiva» → «ampliar cobertura de saúde preventiva». */
export const nomeObjetivo = (objetivo: string) =>
  objetivo.split(" ").map(acentuar).join(" ");
