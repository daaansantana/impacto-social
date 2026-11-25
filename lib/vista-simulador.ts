import { NOTA_BENEFICIARIOS } from "@/lib/avisos";
import { eficiencia, totais } from "@/lib/eficiencia";
import { euros, milhoes, numero, percentagem } from "@/lib/format";
import {
  CENARIOS,
  type Cenario,
  cenarioDe,
  deEPara,
  fatorDeEquilibrio,
  movimentos,
  simular,
} from "@/lib/simulador";
import type { Mes, Projeto } from "@/types";

export const FRACAO = { min: 0, max: 1, passo: 0.05 };
export const FATOR = { min: 1, max: 1.5, passo: 0.05 };

export type LinhaMovimento = {
  id: string;
  nome: string;
  custo: string;
  valor: string;
  beneficiarios: string;
};

export type VistaSimulador = {
  cenario: Cenario | null;
  conclusao: string;
  /** «+227» */
  beneficiarios: string;
  /** «0,56 M€» */
  valor: string;
  valorLegenda: string;
  compensa: boolean;
  fracao: number;
  fator: number;
  fracaoTexto: string;
  fatorTexto: string;
  equilibrio: number;
  equilibrioTexto: string;
  movido: string;
  dao: LinhaMovimento[];
  recebem: LinhaMovimento[];
  pressupostos: string[];
  avisoCapacidade: string | null;
};

const sinal = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${numero(Math.abs(n))}`;
const fatorTexto = (f: number) => `${numero(f, 2)} vezes`;

/** O ecrã 3: o que se ganha ao mover o investimento aprovado, com os pressupostos à vista. */
export function construirSimulador(
  meses: Mes[],
  projetos: Projeto[],
  fracao: number,
  fator: number,
): VistaSimulador {
  const ranking = eficiencia(meses, "euro", true);
  const { de, para } = deEPara(ranking);
  const custoMedio = totais(meses, true).custoPorBeneficiario;
  const base = {
    custos: Object.fromEntries(ranking.map((l) => [l.projeto, l.valor])),
    investimento: Object.fromEntries(
      projetos.map((p) => [p.id, p.investimentoAprovado]),
    ),
    de,
    para,
    custoMedio,
  };
  const entrada = { ...base, fracao, fator };
  const resultado = simular(entrada);
  const { dao, recebem } = movimentos(entrada);
  const equilibrio = fatorDeEquilibrio(
    simular({ ...base, fracao: 1, fator: 1 }),
  );

  const porId = new Map(projetos.map((p) => [p.id, p]));
  const nome = (id: string) => porId.get(id)?.nome ?? id;
  const linhas = (lista: typeof dao, sinalBeneficiarios: 1 | -1) =>
    lista.map((m) => ({
      id: m.projeto,
      nome: nome(m.projeto),
      custo: `${euros(m.custo, 0)} por beneficiário`,
      valor: milhoes(m.valor),
      beneficiarios: `${sinal((sinalBeneficiarios * m.beneficiarios) / 2)} por ano`,
    }));

  // os que recebem e têm a menor capacidade operacional dos 12 parceiros
  const menor = Math.min(...projetos.map((p) => p.parceiro.capacidade));
  const apertados = para.filter(
    (id) => porId.get(id)?.parceiro.capacidade === menor,
  );
  const avisoCapacidade = apertados.length
    ? `Os parceiros do ${apertados.map(nome).join(" e do ")} têm o menor índice de capacidade operacional (sem unidade nos dados) dos 12: ${menor}. O simulador não tem a capacidade em conta.`
    : null;

  const anual = resultado.saldoPorAno;
  const compensa = anual > 0;
  const conclusao =
    fracao === 0
      ? "Sem mover investimento, não se ganha nem se perde ninguém."
      : compensa
        ? `Passar ${percentagem(fracao * 100)} do investimento aprovado dos 4 projetos menos eficientes para os 4 mais eficientes chega a mais ${numero(anual)} beneficiários por ano.`
        : `Com um beneficiário a mais a custar ${fatorTexto(fator)} a média, mover o investimento perde ${numero(Math.abs(anual))} beneficiários por ano.`;

  return {
    cenario: cenarioDe(fracao, fator),
    conclusao,
    beneficiarios: sinal(anual),
    valor: milhoes(Math.abs(resultado.valorEquivalentePorAno)),
    valorLegenda: compensa
      ? "por ano, ao valor de cada beneficiário a mais"
      : "por ano, perdidos",
    compensa,
    fracao,
    fator,
    fracaoTexto: percentagem(fracao * 100),
    fatorTexto: fatorTexto(fator),
    equilibrio,
    equilibrioTexto: numero(equilibrio, 2),
    movido: milhoes(resultado.movido),
    dao: linhas(dao, -1),
    recebem: linhas(recebem, 1),
    pressupostos: [
      `O custo de cada projeto é o de janeiro a outubro, sem o pico de fim de ano.`,
      `Um beneficiário vale o custo médio desses meses: ${euros(custoMedio, 2)}.`,
      "Os planos de investimento cobrem 2 anos: o saldo divide-se por 2.",
      `A mudança compensa enquanto um beneficiário a mais custar menos de ${numero(equilibrio, 2)} vezes a média de quem recebe.`,
      NOTA_BENEFICIARIOS,
    ],
    avisoCapacidade,
  };
}

export { CENARIOS };
