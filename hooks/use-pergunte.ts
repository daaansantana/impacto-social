"use client";

import { useMemo, useState } from "react";
import { useDados } from "@/hooks/use-dados";
import { type MockStep, streamText, useMockRun } from "@/hooks/use-mock-run";
import {
  type PassoLupa,
  type RespostaLupa,
  respostasLupa,
} from "@/lib/pergunte";

/** O que a conversa mostra num dado momento: os passos já chamados e a resposta até onde já chegou. */
export type EstadoConversa = {
  passos: (PassoLupa & { feito: boolean })[];
  resposta: string;
};

const INICIAL: EstadoConversa = { passos: [], resposta: "" };

/** O guião de uma resposta: cada ferramenta começa e acaba, depois a resposta aparece palavra a palavra. */
function guiao(r: RespostaLupa): MockStep<EstadoConversa>[] {
  const passos = r.passos.flatMap((p, i): MockStep<EstadoConversa>[] => [
    {
      delay: 350,
      apply: (s) => ({ ...s, passos: [...s.passos, { ...p, feito: false }] }),
    },
    {
      delay: 650,
      apply: (s) => ({
        ...s,
        passos: s.passos.map((x, j) => (j === i ? { ...x, feito: true } : x)),
      }),
    },
  ]);
  return [
    ...passos,
    ...streamText<EstadoConversa>(
      r.resposta,
      (s, parcial) => ({ ...s, resposta: parcial }),
      { startDelay: 300 },
    ),
  ];
}

/** As 4 perguntas sugeridas, com as respostas feitas pelas funções de lib/, e a pergunta escolhida. */
export function usePergunte() {
  const { dados } = useDados();
  const respostas = useMemo(() => (dados ? respostasLupa(dados) : []), [dados]);
  const [id, setId] = useState<RespostaLupa["id"] | null>(null);
  const escolhida = respostas.find((r) => r.id === id) ?? null;
  return { respostas, escolhida, escolher: setId };
}

/** Uma conversa guiada (use-mock-run, sem chave de API). Muda a `key` de quem a usa para começar outra. */
export function useConversa(resposta: RespostaLupa) {
  const { state, done } = useMockRun(INICIAL, guiao(resposta));
  return { estado: state, pronto: done };
}
