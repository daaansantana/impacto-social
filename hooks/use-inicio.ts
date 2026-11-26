"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import {
  CONTEXTO_EXEMPLO,
  FIM_DE_ANO_EXEMPLO,
  IMPACTO_EXEMPLO,
  PROJETOS_EXEMPLO,
} from "@/lib/exemplo-inicio";
import { construirInicio } from "@/lib/vista-inicio";

/**
 * O Início: o estado do carregamento vem dos dados; a vista, por agora, dos DADOS DE EXEMPLO.
 * Quando chegar o alcancePortefolio, passa a usar dados.impacto, dados.projetos e dados.contexto.
 */
export function useInicio() {
  const { estado, erro, tentarDeNovo } = useDados();
  const vista = useMemo(
    () =>
      estado === "ready"
        ? construirInicio(
            IMPACTO_EXEMPLO,
            PROJETOS_EXEMPLO,
            CONTEXTO_EXEMPLO,
            FIM_DE_ANO_EXEMPLO,
          )
        : null,
    [estado],
  );
  return { estado, erro, tentarDeNovo, vista, exemplo: true as const };
}
