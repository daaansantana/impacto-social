"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { construirDetalhe } from "@/lib/detalhe-acao";

/** O ecrã Ação: os dados e a vista calculada em lib/. */
export function useDetalheAcao(id: string) {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const vista = useMemo(
    () =>
      dados
        ? construirDetalhe(
            dados.impacto,
            dados.projetos,
            dados.contexto,
            dados.mensal,
            id,
          )
        : null,
    [dados, id],
  );
  return { estado, erro, tentarDeNovo, vista };
}
