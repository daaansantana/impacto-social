"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { construirConfianca } from "@/lib/vista-confianca";

/** O ecrã 4: a qualidade dos dados. */
export function useConfianca() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const vista = useMemo(
    () => (dados ? construirConfianca(dados.qualidade) : null),
    [dados],
  );
  return { estado, erro, tentarDeNovo, vista, projetos: dados?.projetos ?? [] };
}
