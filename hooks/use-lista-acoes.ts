"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { juntarAcoes } from "@/lib/acoes";
import {
  type CampoFiltro,
  construirListaAcoes,
  escreverSelecao,
  lerSelecao,
  type Ordenacao,
  opcoesFiltros,
} from "@/lib/lista-acoes";

/** A lista de Ações: os filtros e a ordenação vivem no URL, para se poder recarregar e partilhar. */
export function useListaAcoes() {
  const { dados } = useDados();
  const params = useSearchParams();
  const router = useRouter();
  const rota = usePathname();

  const opcoes = useMemo(
    () =>
      dados
        ? opcoesFiltros(
            juntarAcoes(dados.impacto, dados.projetos, dados.contexto),
          )
        : null,
    [dados],
  );
  const selecao = useMemo(
    () => (opcoes ? lerSelecao(params, opcoes) : null),
    [params, opcoes],
  );
  const lista = useMemo(
    () =>
      dados && selecao
        ? construirListaAcoes(
            dados.impacto,
            dados.projetos,
            dados.contexto,
            selecao,
          )
        : null,
    [dados, selecao],
  );

  const ir = useCallback(
    (nova: NonNullable<typeof selecao>) =>
      router.replace(`${rota}${escreverSelecao(nova)}`, { scroll: false }),
    [router, rota],
  );
  const setFiltro = useCallback(
    (campo: CampoFiltro, valor: string) => {
      if (selecao)
        ir({
          ...selecao,
          filtros: { ...selecao.filtros, [campo]: valor || undefined },
        });
    },
    [selecao, ir],
  );
  const setOrdem = useCallback(
    (ordem: Ordenacao) => {
      if (selecao) ir({ ...selecao, ordem });
    },
    [selecao, ir],
  );
  const limpar = useCallback(() => {
    if (selecao) ir({ filtros: {}, ordem: selecao.ordem });
  }, [selecao, ir]);

  return { selecao, lista, setFiltro, setOrdem, limpar };
}
