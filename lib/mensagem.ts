import type { Projeto, ResultadoAuditoria } from "@/types";

/** O email ao parceiro com o que corrigir no ficheiro. */
export function mensagemParceiro(
  _resultado: ResultadoAuditoria,
  _projeto: Projeto,
): string {
  throw new Error("Por fazer: mensagemParceiro");
}
