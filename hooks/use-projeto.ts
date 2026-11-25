"use client";

import { useMemo } from "react";
import { useComparaveis } from "@/hooks/use-comparaveis";
import { useDados } from "@/hooks/use-dados";
import { construirProjeto } from "@/lib/vista-projeto";

/** O ecrã 2: um projeto, com o interruptor partilhado com o Portefólio. */
export function useProjeto(id: string) {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [comparaveis, setComparaveis] = useComparaveis();
  const vista = useMemo(
    () =>
      dados
        ? construirProjeto(dados.mensal, dados.projetos, id, comparaveis)
        : null,
    [dados, id, comparaveis],
  );
  return { estado, erro, tentarDeNovo, vista, comparaveis, setComparaveis };
}
