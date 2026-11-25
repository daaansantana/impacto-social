"use client";

import { useMemo } from "react";
import { useComparaveis } from "@/hooks/use-comparaveis";
import { useDados } from "@/hooks/use-dados";
import { useUnidade } from "@/hooks/use-unidade";
import { construirPortefolio } from "@/lib/portefolio";

/** O ecrã 1: os dados, as escolhas e a vista calculada em lib/. */
export function usePortefolio() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [comparaveis, setComparaveis] = useComparaveis();
  const [unidade, setUnidade] = useUnidade();
  const vista = useMemo(
    () =>
      dados
        ? construirPortefolio(
            dados.mensal,
            dados.projetos,
            unidade,
            comparaveis,
          )
        : null,
    [dados, unidade, comparaveis],
  );
  return {
    estado,
    erro,
    tentarDeNovo,
    vista,
    unidade,
    setUnidade,
    comparaveis,
    setComparaveis,
  };
}
