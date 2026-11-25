import type { EntradaSimulacao, Simulacao } from "@/types";

const aoCentimo = (euros: number) => Math.round(euros * 100) / 100;

/** Beneficiários perdidos e ganhos ao mover investimento de `de` para `para`. */
export function simular({
  custos,
  investimento,
  de,
  para,
  fracao,
  fator,
  custoMedio,
}: EntradaSimulacao): Simulacao {
  // Os custos entram ao cêntimo, como na SPEC (2 450,89 €).
  const custo = (id: string) => aoCentimo(custos[id]);
  const movido = de.reduce((s, id) => s + investimento[id] * fracao, 0);
  const perdidos = de.reduce(
    (s, id) => s + (investimento[id] * fracao) / custo(id),
    0,
  );
  // quem recebe fica com partes iguais; um beneficiário a mais custa `fator` vezes o seu custo
  const parte = movido / para.length;
  const ganhos = para.reduce((s, id) => s + parte / (custo(id) * fator), 0);
  const saldo = ganhos - perdidos;
  // os planos cobrem 2 anos
  const saldoPorAno = saldo / 2;
  return {
    movido,
    perdidos,
    ganhos,
    saldo,
    saldoPorAno,
    valorEquivalentePorAno: saldoPorAno * aoCentimo(custoMedio),
  };
}

/** Até quantas vezes o custo médio a mudança compensa: ganhos ÷ perdidos do cenário otimista. */
export function fatorDeEquilibrio(otimista: Simulacao): number {
  return otimista.ganhos / otimista.perdidos;
}
