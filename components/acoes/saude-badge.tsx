import { Badge } from "@/components/ui/badge";
import type { NivelSaude } from "@/types";

// O vermelho fica só para erros: «a rever» é âmbar.
const COR: Record<NivelSaude, string> = {
  forte: "bg-verde",
  "a acompanhar": "bg-ardosia",
  "a rever": "bg-ambar",
};

/** A saúde da ação: a cor vai sempre com o texto. */
export function SaudeBadge({ nivel }: { nivel: NivelSaude }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span aria-hidden className={`size-2 rounded-full ${COR[nivel]}`} />
      Saúde: {nivel}
    </Badge>
  );
}
