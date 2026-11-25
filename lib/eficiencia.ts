import { filtrarMeses } from "@/lib/meses";
import type { LinhaEficiencia, Mes, Totais, Unidade } from "@/types";

type Somas = {
  despesa: number;
  beneficiarios: number;
  horasVoluntariado: number;
  jovensFormados: number;
};

/** As somas de cada projeto, por ordem de id. */
function somasPorProjeto(meses: Mes[]): [string, Somas][] {
  const somas = new Map<string, Somas>();
  for (const m of meses) {
    const s = somas.get(m.projeto) ?? {
      despesa: 0,
      beneficiarios: 0,
      horasVoluntariado: 0,
      jovensFormados: 0,
    };
    s.despesa += m.despesa;
    s.beneficiarios += m.beneficiarios;
    s.horasVoluntariado += m.horasVoluntariado;
    s.jovensFormados += m.jovensFormados;
    somas.set(m.projeto, s);
  }
  return [...somas].sort(([a], [b]) => a.localeCompare(b));
}

const CONTAS: Record<
  Unidade,
  { valor: (s: Somas) => number; menosEMelhor: boolean }
> = {
  // euros por beneficiário
  euro: { valor: (s) => s.despesa / s.beneficiarios, menosEMelhor: true },
  // beneficiários por 1000 horas de voluntariado
  hora: {
    valor: (s) => (s.beneficiarios / s.horasVoluntariado) * 1000,
    menosEMelhor: false,
  },
  // euros por jovem formado
  jovem: { valor: (s) => s.despesa / s.jovensFormados, menosEMelhor: true },
};

/** O ranking dos projetos na unidade escolhida, com a posição 1 para o melhor. */
export function eficiencia(
  meses: Mes[],
  unidade: Unidade,
  comparaveis: boolean,
): LinhaEficiencia[] {
  const { valor, menosEMelhor } = CONTAS[unidade];
  const linhas = somasPorProjeto(filtrarMeses(meses, comparaveis)).map(
    ([projeto, s]) => ({ projeto, valor: valor(s) }),
  );
  // sort é estável: num empate fica primeiro o id mais baixo
  return linhas
    .sort((a, b) => (menosEMelhor ? a.valor - b.valor : b.valor - a.valor))
    .map((l, i) => ({ ...l, posicao: i + 1 }));
}

/** A despesa, os beneficiários e as horas de todos os projetos juntos. */
export function totais(_meses: Mes[], _comparaveis: boolean): Totais {
  throw new Error("Por fazer: totais");
}
