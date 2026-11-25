import type { ResultadoAuditoria } from "@/types";

/** Os problemas de um CSV do parceiro: as linhas vêm do Papa Parse, tudo como texto. */
export function auditar(_linhas: Record<string, string>[]): ResultadoAuditoria {
  throw new Error("Por fazer: auditar");
}
