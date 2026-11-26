import { Suspense } from "react";
import { EstadoCarregar } from "@/components/estados/estados";
import { EcraAcoes } from "./ecra";

// Os filtros vêm do URL (useSearchParams): o ecrã fica dentro de um Suspense.
export default function AcoesPage() {
  return (
    <Suspense fallback={<EstadoCarregar />}>
      <EcraAcoes />
    </Suspense>
  );
}
