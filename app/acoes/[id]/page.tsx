import { Suspense } from "react";
import { EstadoCarregar } from "@/components/estados/estados";
import { EcraAcao } from "./ecra";

// O ecrã lê o id com useParams: fica dentro de um Suspense para a página poder ser pré-renderizada.
export default function AcaoPage() {
  return (
    <Suspense fallback={<EstadoCarregar />}>
      <EcraAcao />
    </Suspense>
  );
}
