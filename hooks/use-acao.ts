"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { construirAcao } from "@/lib/vista-acao";

/** O ecrã de uma ação. */
export function useAcao(id: string) {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const vista = useMemo(
    () => (dados ? construirAcao(dados, id) : null),
    [dados, id],
  );
  return { estado, erro, tentarDeNovo, vista };
}
