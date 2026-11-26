"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { construirInicio } from "@/lib/vista-inicio";

/** O Início: os dados e a vista calculada em lib/, com o alcancePortefolio e o fim de ano reais. */
export function useInicio() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const vista = useMemo(
    () =>
      dados
        ? construirInicio(
            dados.impacto,
            dados.projetos,
            dados.contexto,
            dados.mensal,
          )
        : null,
    [dados],
  );
  return { estado, erro, tentarDeNovo, vista };
}
