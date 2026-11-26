import type { PontoMapa } from "@/types";

/**
 * Pontos de exemplo para o MapaAcoes, até o Início ler o impacto.json.
 * As coordenadas são as capitais do contexto.json; os IIS são inventados.
 */
const EXEMPLO: Omit<PontoMapa, "cor">[] = [
  {
    id: "E1",
    nome: "Exemplo, Brasil",
    latitude: -15.78,
    longitude: -47.93,
    iis: 72,
  },
  {
    id: "E2",
    nome: "Exemplo, Quénia",
    latitude: -1.28,
    longitude: 36.81,
    iis: 55,
  },
  {
    id: "E3",
    nome: "Exemplo, Índia",
    latitude: 28.64,
    longitude: 77.23,
    iis: 38,
  },
  {
    id: "E4",
    nome: "Exemplo, Portugal",
    latitude: 38.71,
    longitude: -9.14,
    iis: 64,
  },
  {
    id: "E5",
    nome: "Exemplo, Filipinas",
    latitude: 14.55,
    longitude: 121.04,
    iis: 47,
  },
  {
    id: "E6",
    nome: "Exemplo, Moçambique",
    latitude: -25.97,
    longitude: 32.57,
    iis: 29,
  },
];

/** A cor de exemplo: verde a partir de 60, âmbar a partir de 40, vermelho abaixo. */
function corExemplo(iis: number): string {
  if (iis >= 60) return "#16a34a";
  if (iis >= 40) return "#d97706";
  return "#dc2626";
}

export const PONTOS_EXEMPLO: PontoMapa[] = EXEMPLO.map((p) => ({
  ...p,
  cor: corExemplo(p.iis),
}));
