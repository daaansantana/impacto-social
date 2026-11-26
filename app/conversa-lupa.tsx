"use client";

import { Conversa } from "@/components/inicio/pergunte-lupa";
import { useConversa } from "@/hooks/use-pergunte";
import type { RespostaLupa } from "@/lib/pergunte";

/** Corre o guião de uma resposta; o Início monta-a com `key` igual à pergunta, para recomeçar a cada escolha. */
export function ConversaLupa({ resposta }: { resposta: RespostaLupa }) {
  const { estado, pronto } = useConversa(resposta);
  return (
    <Conversa
      pergunta={resposta.pergunta}
      passos={estado.passos}
      resposta={estado.resposta}
      pronto={pronto}
    />
  );
}
