import type { EntradaSimulacao, LinhaEficiencia, Simulacao } from "@/types";

const aoCentimo = (euros: number) => Math.round(euros * 100) / 100;

/** Os três cenários do PRODUCT e da SPEC. */
export const CENARIOS = {
  prudente: { rotulo: "Prudente", fracao: 0.5, fator: 1.2 },
  provavel: { rotulo: "Provável", fracao: 1, fator: 1.2 },
  otimista: { rotulo: "Otimista", fracao: 1, fator: 1 },
} as const;
export type Cenario = keyof typeof CENARIOS;

/** O cenário com esta parte e este fator, ou null se os pressupostos foram mudados à mão. */
export function cenarioDe(fracao: number, fator: number): Cenario | null {
  const perto = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  return (
    (Object.keys(CENARIOS) as Cenario[]).find(
      (c) =>
        perto(CENARIOS[c].fracao, fracao) && perto(CENARIOS[c].fator, fator),
    ) ?? null
  );
}

/** Dão os 4 piores por euro; recebem os 4 melhores. O ranking vem de eficiencia(..., "euro", true). */
export function deEPara(ranking: LinhaEficiencia[]) {
  const ordem = [...ranking].sort((a, b) => a.posicao - b.posicao);
  return {
    de: ordem.slice(-4).map((l) => l.projeto),
    para: ordem.slice(0, 4).map((l) => l.projeto),
  };
}

export type Movimento = {
  projeto: string;
  /** custo por beneficiário, ao cêntimo */
  custo: number;
  /** euros que saem (quem dá) ou entram (quem recebe) */
  valor: number;
  /** beneficiários perdidos (quem dá) ou ganhos (quem recebe), nos 2 anos */
  beneficiarios: number;
};

/** O que sai de cada projeto que dá e o que entra em cada um que recebe. */
export function movimentos({
  custos,
  investimento,
  de,
  para,
  fracao,
  fator,
}: EntradaSimulacao): { dao: Movimento[]; recebem: Movimento[] } {
  // Os custos entram ao cêntimo, como na SPEC (2 450,89 €).
  const custo = (id: string) => aoCentimo(custos[id]);
  const dao = de.map((projeto) => {
    const valor = investimento[projeto] * fracao;
    return {
      projeto,
      custo: custo(projeto),
      valor,
      beneficiarios: valor / custo(projeto),
    };
  });
  // quem recebe fica com partes iguais; um beneficiário a mais custa `fator` vezes o seu custo
  const parte = dao.reduce((s, d) => s + d.valor, 0) / para.length;
  const recebem = para.map((projeto) => ({
    projeto,
    custo: custo(projeto),
    valor: parte,
    beneficiarios: parte / (custo(projeto) * fator),
  }));
  return { dao, recebem };
}

/** Beneficiários perdidos e ganhos ao mover investimento de `de` para `para`. */
export function simular(entrada: EntradaSimulacao): Simulacao {
  const { dao, recebem } = movimentos(entrada);
  const movido = dao.reduce((s, d) => s + d.valor, 0);
  const perdidos = dao.reduce((s, d) => s + d.beneficiarios, 0);
  const ganhos = recebem.reduce((s, r) => s + r.beneficiarios, 0);
  const saldo = ganhos - perdidos;
  // os planos cobrem 2 anos
  const saldoPorAno = saldo / 2;
  return {
    movido,
    perdidos,
    ganhos,
    saldo,
    saldoPorAno,
    valorEquivalentePorAno: saldoPorAno * aoCentimo(entrada.custoMedio),
  };
}

/** Até quantas vezes o custo médio a mudança compensa: ganhos ÷ perdidos do cenário otimista. */
export function fatorDeEquilibrio(otimista: Simulacao): number {
  return otimista.ganhos / otimista.perdidos;
}
