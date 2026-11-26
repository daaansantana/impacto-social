"use client";

import { useMemo, useState } from "react";
import { useAuditor } from "@/hooks/use-auditor";
import { useDados } from "@/hooks/use-dados";
import { type Pesos, PREDEFINICOES, type Predefinicao } from "@/lib/iis";
import { construirComoMedimos } from "@/lib/vista-como-medimos";

/** O ecrã Como medimos: os pesos começam no Equilibrado; o auditor vem do ecrã Confiança. */
export function useComoMedimos() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [pesos, setPesos] = useState<Pesos>({
    ...PREDEFINICOES.equilibrado.pesos,
  });
  const auditor = useAuditor(dados?.projetos ?? []);
  const vista = useMemo(
    () => (dados ? construirComoMedimos(dados, pesos) : null),
    [dados, pesos],
  );
  return {
    estado,
    erro,
    tentarDeNovo,
    vista,
    pesos,
    escolherPredefinicao: (p: Predefinicao) =>
      setPesos({ ...PREDEFINICOES[p].pesos }),
    mudarPeso: (d: keyof Pesos, v: number) =>
      setPesos((atual) => ({ ...atual, [d]: v })),
    auditor,
  };
}
