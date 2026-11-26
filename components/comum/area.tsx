import { Pais } from "@/components/comum/bandeira";
import { Badge } from "@/components/ui/badge";
import { iconeArea } from "@/lib/areas";
import type { Local } from "@/lib/nomes";
import { cn } from "@/lib/utils";

/** O ícone da área, decorativo: o nome vai sempre ao lado. */
export function IconeArea({
  area,
  size = 18,
  className,
}: {
  area: string;
  size?: number;
  className?: string;
}) {
  const Icone = iconeArea(area);
  return Icone ? (
    <Icone size={size} aria-hidden className={cn("shrink-0", className)} />
  ) : null;
}

/** A área numa etiqueta menta, com o ícone. */
export function EtiquetaArea({ area, nome }: { area: string; nome: string }) {
  return (
    <Badge variant="secondary" className="h-6 gap-1.5 px-2 text-sm">
      <IconeArea area={area} size={16} />
      {nome}
    </Badge>
  );
}

/** Onde fica a ação: o país e a área numa etiqueta. */
export function Onde({
  local,
  className,
}: {
  local: Local;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1",
        className,
      )}
    >
      <Pais pais={local.pais} nome={local.paisNome} />
      <EtiquetaArea area={local.area} nome={local.areaEtiqueta} />
    </span>
  );
}
