"use client";

import { useEffect, useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import type { Filtros, Ordenacao } from "@/lib/acoes";
import { escreverFiltros, lerFiltros } from "@/lib/filtros-url";
import { construirAcoes } from "@/lib/vista-acoes";

/** O ecrã Ações: os filtros e a ordenação vivem no URL, para se poder partilhar. */
export function useAcoes() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [filtros, setFiltros] = useState<Filtros>({});
  const [ordem, setOrdem] = useState<Ordenacao>("iis");
  const [lido, setLido] = useState(false);

  // lê o URL uma vez, quando os dados chegam (para validar os países e as áreas)
  useEffect(() => {
    if (!dados || lido) return;
    const r = lerFiltros(window.location.search, {
      paises: dados.projetos.map((p) => p.pais),
      areas: dados.projetos.map((p) => p.area),
    });
    setFiltros(r.filtros);
    setOrdem(r.ordem);
    setLido(true);
  }, [dados, lido]);

  // escreve no URL sem recarregar
  useEffect(() => {
    if (!lido) return;
    const url = `${window.location.pathname}${escreverFiltros(filtros, ordem)}`;
    window.history.replaceState(null, "", url);
  }, [filtros, ordem, lido]);

  const vista = useMemo(
    () => (dados ? construirAcoes(dados, filtros, ordem) : null),
    [dados, filtros, ordem],
  );

  return {
    estado,
    erro,
    tentarDeNovo,
    vista,
    filtros,
    ordem,
    mudarFiltro: (chave: keyof Filtros, valor: string) =>
      setFiltros((f) => ({ ...f, [chave]: valor || undefined })),
    limparFiltros: () => setFiltros({}),
    setOrdem,
  };
}
