"use client";

import { useMemo } from "react";
import { useDados } from "@/hooks/use-dados";
import { type MockStep, streamText, useMockRun } from "@/hooks/use-mock-run";
import {
  type PassoLupa,
  type RespostaLupa,
  respostasLupa,
} from "@/lib/pergunte";
import { usePergunteStore } from "@/store/pergunte";

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

/** As 4 perguntas sugeridas, com as respostas feitas pelas funções de lib/, a pergunta escolhida e se a folha está aberta. */
export function usePergunte() {
  const { dados } = useDados();
  const respostas = useMemo(() => (dados ? respostasLupa(dados) : []), [dados]);
  const id = usePergunteStore((s) => s.escolhida);
  const escolher = usePergunteStore((s) => s.escolher);
  const aberta = usePergunteStore((s) => s.aberta);
  const setAberta = usePergunteStore((s) => s.setAberta);
  const escolhida = respostas.find((r) => r.id === id) ?? null;
  return { respostas, escolhida, escolher, aberta, setAberta };
}

/** Abre a folha «Pergunte à Lupa», de qualquer ecrã. */
export function useAbrirPergunte() {
  return usePergunteStore((s) => s.abrir);
}

/** Uma conversa guiada (use-mock-run, sem chave de API). Muda a `key` de quem a usa para começar outra. */
export function useConversa(resposta: RespostaLupa) {
  const { state, done } = useMockRun(INICIAL, guiao(resposta));
  return { estado: state, pronto: done };
}
