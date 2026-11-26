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
