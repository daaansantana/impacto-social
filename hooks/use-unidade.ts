"use client";

import { useDadosStore } from "@/store/dados";

/** A unidade da eficiência no Portefólio: por euro ou por jovem formado. */
export function useUnidade() {
  const unidade = useDadosStore((s) => s.unidade);
  const setUnidade = useDadosStore((s) => s.setUnidade);
  return [unidade, setUnidade] as const;
}
