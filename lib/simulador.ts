import type { EntradaSimulacao, Simulacao } from "@/types";

/** Beneficiários perdidos e ganhos ao mover investimento de `de` para `para`. */
export function simular(_entrada: EntradaSimulacao): Simulacao {
  throw new Error("Por fazer: simular");
}

/** Até quantas vezes o custo médio a mudança compensa: ganhos ÷ perdidos do cenário otimista. */
export function fatorDeEquilibrio(_otimista: Simulacao): number {
  throw new Error("Por fazer: fatorDeEquilibrio");
}
