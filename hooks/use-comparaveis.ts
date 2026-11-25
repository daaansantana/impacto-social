"use client";

import { useDadosStore } from "@/store/dados";

/** O interruptor «meses comparáveis», partilhado pelos ecrãs 1 e 2. */
export function useComparaveis() {
  const comparaveis = useDadosStore((s) => s.comparaveis);
  const setComparaveis = useDadosStore((s) => s.setComparaveis);
  return [comparaveis, setComparaveis] as const;
}
