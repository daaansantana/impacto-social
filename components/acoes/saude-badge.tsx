import { Badge } from "@/components/ui/badge";
import type { NivelSaude } from "@/types";

const COR: Record<NivelSaude, string> = {
  forte: "bg-emerald-600",
  "a acompanhar": "bg-amber-500",
  "a rever": "bg-red-600",
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
