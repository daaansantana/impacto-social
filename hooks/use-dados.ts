"use client";

import { useEffect } from "react";
import { useDadosStore } from "@/store/dados";

/** Os quatro ficheiros de public/data, com o estado do carregamento. */
export function useDados() {
  const estado = useDadosStore((s) => s.estado);
  const erro = useDadosStore((s) => s.erro);
  const dados = useDadosStore((s) => s.dados);
  const carregar = useDadosStore((s) => s.carregar);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { estado, erro, dados, tentarDeNovo: carregar };
}
