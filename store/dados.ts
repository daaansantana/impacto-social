import { create } from "zustand";
import {
  fetchMensal,
  fetchPlanos,
  fetchProjetos,
  fetchQualidade,
} from "@/services/data";
import type { Dados, Unidade } from "@/types";

export type EstadoDados = "idle" | "loading" | "ready" | "error";

type DadosState = {
  estado: EstadoDados;
  erro: string | null;
  dados: Dados | null;
  /** «Meses comparáveis (jan–out)»: ligado por omissão */
  comparaveis: boolean;
  unidade: Unidade;
  carregar: () => Promise<void>;
  setComparaveis: (comparaveis: boolean) => void;
  setUnidade: (unidade: Unidade) => void;
};

export const useDadosStore = create<DadosState>()((set, get) => ({
  estado: "idle",
  erro: null,
  dados: null,
  comparaveis: true,
  unidade: "euro",
  carregar: async () => {
    // Os dados carregam uma só vez; depois de um erro, pode tentar-se de novo.
    const { estado } = get();
    if (estado === "loading" || estado === "ready") return;
    set({ estado: "loading", erro: null });
    try {
      const [mensal, projetos, planos, qualidade] = await Promise.all([
        fetchMensal(),
        fetchProjetos(),
        fetchPlanos(),
        fetchQualidade(),
      ]);
      set({
        estado: "ready",
        dados: { mensal, projetos, planos, qualidade },
      });
    } catch (e) {
      set({
        estado: "error",
        erro: e instanceof Error ? e.message : "Não foi possível ler os dados.",
      });
    }
  },
  setComparaveis: (comparaveis) => set({ comparaveis }),
  setUnidade: (unidade) => set({ unidade }),
}));
