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
