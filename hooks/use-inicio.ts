"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { construirInicio } from "@/lib/vista-inicio";

/** O Início, com os dados reais: o impacto, os projetos, o contexto e os meses. */
export function useInicio() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const vista = useMemo(() => (dados ? construirInicio(dados) : null), [dados]);
  return { estado, erro, tentarDeNovo, vista };
}
