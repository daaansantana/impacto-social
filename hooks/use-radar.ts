"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import { juntarAcoes } from "@/lib/acoes";
import { nomePais } from "@/lib/nomes";
import {
  type EntradaNovoProjeto,
  medianaEvidencia,
  novoProjeto,
  quadrante,
} from "@/lib/radar";
import {
  areasDoRadar,
  construirRadar,
  opcoesAreas,
  vistaNovoProjeto,
} from "@/lib/vista-radar";

/**
 * O Radar: as células do radar.json; o limite da evidência alta é a mediana das ações
 * (medianaEvidencia); o quadrante e o novoProjeto são os do Dan (lib/radar.ts).
 */
export function useRadar() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [escolhida, setArea] = useState<string | null>(null);
  const [entrada, setEntrada] = useState<EntradaNovoProjeto | null>(null);

  const areas = useMemo(
    () => (dados ? areasDoRadar(dados.radar) : []),
    [dados],
  );
  const area = escolhida ?? areas[0] ?? "";
  const acoes = useMemo(
    () =>
      dados ? juntarAcoes(dados.impacto, dados.projetos, dados.contexto) : [],
    [dados],
  );

  const vista = useMemo(
    () =>
      dados && area
        ? construirRadar(
            dados.radar,
            dados.contexto,
            area,
            medianaEvidencia(dados.impacto),
            quadrante,
          )
        : null,
    [dados, area],
  );

  const paises = useMemo(
    () =>
      [...new Set((dados?.radar ?? []).map((c) => c.pais))]
        .map((p) => ({ valor: p, rotulo: nomePais(p) }))
        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt")),
    [dados],
  );

  const resultado = useMemo(() => {
    if (!entrada || !dados) return null;
    const celula = dados.radar.find(
      (c) => c.pais === entrada.pais && c.area === entrada.area,
    );
    return vistaNovoProjeto(
      novoProjeto(entrada, {
        acoes,
        contexto: dados.contexto,
        celulas: dados.radar,
      }),
      celula,
      (projeto) => acoes.find((a) => a.projeto === projeto)?.confianca,
    );
  }, [entrada, dados, acoes]);

  return {
    estado,
    erro,
    tentarDeNovo,
    areas: opcoesAreas(areas),
    paises,
    area,
    setArea,
    vista,
    calcular: setEntrada,
    entrada,
    resultado,
  };
}
