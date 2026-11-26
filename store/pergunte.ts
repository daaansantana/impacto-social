import { create } from "zustand";
import type { RespostaLupa } from "@/lib/pergunte";

type PergunteState = {
  /** a folha «Pergunte à Lupa» está aberta */
  aberta: boolean;
  escolhida: RespostaLupa["id"] | null;
  abrir: () => void;
  setAberta: (aberta: boolean) => void;
  escolher: (id: RespostaLupa["id"]) => void;
};

/** A folha «Pergunte à Lupa» é uma só: abre-se da barra lateral e do Início. */
export const usePergunteStore = create<PergunteState>()((set) => ({
  aberta: false,
  escolhida: null,
  abrir: () => set({ aberta: true }),
  setAberta: (aberta) => set({ aberta }),
  escolher: (escolhida) => set({ escolhida }),
}));
