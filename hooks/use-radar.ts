"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import {
  construirRadar,
  LEITURAS,
  simularNovoProjeto,
} from "@/lib/vista-radar";

/** O Radar: a área escolhida e o formulário do novo projeto. */
export function useRadar() {
  const { estado, erro, dados, tentarDeNovo } = useDados();
  const [area, setArea] = useState("educacao");
  const [novo, setNovo] = useState({
    pais: "Senegal",
    area: "educacao",
    formato: "",
    orcamento: 100000,
  });

  const vista = useMemo(
    () => (dados ? construirRadar(dados, area) : null),
    [dados, area],
  );
  const formatos = vista?.opcoes.formatos[novo.area] ?? [];
  const formato = formatos.includes(novo.formato)
    ? novo.formato
    : (formatos[0] ?? "");
  const resultado = useMemo(
    () =>
      dados && novo.orcamento > 0
        ? simularNovoProjeto(dados, {
            ...novo,
            formato: formato || "atividades",
          })
        : null,
    [dados, novo, formato],
  );

  return {
    estado,
    erro,
    tentarDeNovo,
    vista,
    area,
    setArea,
    novo: { ...novo, formato },
    formatos,
    mudarNovo: (
      campo: "pais" | "area" | "formato" | "orcamento",
      valor: string,
    ) =>
      setNovo((n) => ({
        ...n,
        [campo]:
          campo === "orcamento" ? Math.max(0, Number(valor) || 0) : valor,
      })),
    resultado,
    leituraTexto: resultado ? LEITURAS[resultado.leitura] : "",
  };
}
