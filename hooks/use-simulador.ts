"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import { CENARIOS, type Cenario } from "@/lib/simulador";
import { construirSimulador } from "@/lib/vista-simulador";

/** O ecrã 3: os pressupostos começam no cenário provável. */
export function useSimulador() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [fracao, setFracao] = useState<number>(CENARIOS.provavel.fracao);
  const [fator, setFator] = useState<number>(CENARIOS.provavel.fator);
  const vista = useMemo(
    () =>
      dados
        ? construirSimulador(dados.mensal, dados.projetos, fracao, fator)
        : null,
    [dados, fracao, fator],
  );
  const escolherCenario = (c: Cenario) => {
    setFracao(CENARIOS[c].fracao);
    setFator(CENARIOS[c].fator);
  };
  return {
    estado,
    erro,
    tentarDeNovo,
    vista,
    setFracao,
    setFator,
    escolherCenario,
  };
}
