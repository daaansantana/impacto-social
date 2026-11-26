import type { Filtros, Ordenacao } from "@/lib/acoes";
import { ORDENACOES } from "@/lib/acoes";
import type { NivelSaude, Regiao } from "@/types";

const REGIOES: Regiao[] = ["África", "América do Sul", "Ásia", "Europa"];
const SAUDE: NivelSaude[] = ["forte", "a acompanhar", "a rever"];
const CONFIANCA = ["alta", "média", "baixa"] as const;

/** Lê os filtros e a ordenação do URL (por exemplo «?regiao=África&ordem=eficiencia»); ignora o que não conhece. */
export function lerFiltros(
  pesquisa: string,
  validos: { paises: string[]; areas: string[] },
): { filtros: Filtros; ordem: Ordenacao } {
  const p = new URLSearchParams(pesquisa);
  const um = <T extends string>(chave: string, lista: readonly T[]) => {
    const v = p.get(chave);
    return v && (lista as readonly string[]).includes(v) ? (v as T) : undefined;
  };
  const ordem = um("ordem", Object.keys(ORDENACOES) as Ordenacao[]) ?? "iis";
  return {
    filtros: {
      regiao: um("regiao", REGIOES),
      pais: um("pais", validos.paises),
      area: um("area", validos.areas),
      saude: um("saude", SAUDE),
      confianca: um("confianca", CONFIANCA),
    },
    ordem,
  };
}

/** Escreve os filtros e a ordenação no URL, só com o que está escolhido. */
export function escreverFiltros(filtros: Filtros, ordem: Ordenacao): string {
  const p = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros))
    if (valor) p.set(chave, valor);
  if (ordem !== "iis") p.set("ordem", ordem);
  const s = p.toString();
  return s ? `?${s}` : "";
}
