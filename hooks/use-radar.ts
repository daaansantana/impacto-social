"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import {
  AREAS_RADAR,
  type EntradaNovoProjeto,
  LIMITE_EVIDENCIA_EXEMPLO,
  novoProjetoExemplo,
  quadranteExemplo,
  RADAR_EXEMPLO,
} from "@/lib/exemplo-radar";
import { nomePais } from "@/lib/nomes";
import {
  construirRadar,
  opcoesAreas,
  vistaNovoProjeto,
} from "@/lib/vista-radar";

/**
 * O Radar. O estado do carregamento e os países vêm dos dados; as células, o quadrante e o
 * novoProjeto, por agora, dos DADOS DE EXEMPLO. Para ligar as funções do Dan, trocam-se só estas
 * quatro peças: dados.radar, medianaEvidencia(dados.impacto), quadrante e novoProjeto (lib/radar.ts).
 */
const FONTE = {
  exemplo: true,
  celulas: RADAR_EXEMPLO,
  limite: LIMITE_EVIDENCIA_EXEMPLO,
  quadrante: quadranteExemplo,
  novoProjeto: novoProjetoExemplo,
};

export function useRadar() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [area, setArea] = useState<string>(AREAS_RADAR[0]);
  const [entrada, setEntrada] = useState<EntradaNovoProjeto | null>(null);

  const vista = useMemo(
    () =>
      dados
        ? construirRadar(
            FONTE.celulas,
            dados.contexto,
            area,
            FONTE.limite,
            FONTE.quadrante,
          )
        : null,
    [dados, area],
  );

  const paises = useMemo(
    () =>
      [...new Set(FONTE.celulas.map((c) => c.pais))]
        .map((p) => ({ valor: p, rotulo: nomePais(p) }))
        .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt")),
    [],
  );

  const resultado = useMemo(() => {
    if (!entrada) return null;
    const celula = FONTE.celulas.find(
      (c) => c.pais === entrada.pais && c.area === entrada.area,
    );
    return vistaNovoProjeto(
      FONTE.novoProjeto(entrada, { celulas: FONTE.celulas }),
      celula,
    );
  }, [entrada]);

  return {
    estado,
    erro,
    tentarDeNovo,
    exemplo: FONTE.exemplo,
    areas: opcoesAreas(AREAS_RADAR),
    paises,
    area,
    setArea,
    vista,
    calcular: setEntrada,
    entrada,
    resultado,
  };
}
