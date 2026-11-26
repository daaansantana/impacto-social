"use client";

import { Conversa, FolhaPergunte } from "@/components/inicio/pergunte-lupa";
import { useConversa, usePergunte } from "@/hooks/use-pergunte";
import type { RespostaLupa } from "@/lib/pergunte";

/** Corre o guião de uma resposta; a folha monta-a com `key` igual à pergunta, para recomeçar a cada escolha. */
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

/** A folha «Pergunte à Lupa», uma só para toda a app: abre-se da barra lateral e do Início. */
export function FolhaLupa() {
  const lupa = usePergunte();
  return (
    <FolhaPergunte
      aberta={lupa.aberta}
      onAberta={lupa.setAberta}
      perguntas={lupa.respostas}
      escolhida={lupa.escolhida?.id ?? null}
      onEscolher={lupa.escolher}
      conversa={
        lupa.escolhida ? (
          <ConversaLupa key={lupa.escolhida.id} resposta={lupa.escolhida} />
        ) : null
      }
    />
  );
}
