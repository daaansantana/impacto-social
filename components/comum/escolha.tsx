import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type OpcaoEscolha = { valor: string; rotulo: string; icone?: ReactNode };

/** Uma lista de escolha: o Select do shadcn, para o menu aberto usar a letra da app e não a do sistema. */
export function Escolha({
  id,
  valor,
  onValor,
  opcoes,
  className,
}: {
  /** o id do botão, para o `<Label htmlFor>` */
  id: string;
  valor: string;
  onValor: (valor: string) => void;
  opcoes: OpcaoEscolha[];
  className?: string;
}) {
  const porValor = new Map(opcoes.map((o) => [o.valor, o]));
  return (
    <Select
      value={valor}
      onValueChange={(v) => onValor(v ?? "")}
      items={opcoes.map((o) => ({ value: o.valor, label: o.rotulo }))}
    >
      <SelectTrigger
        id={id}
        className={cn("w-full text-base data-[size=default]:h-11", className)}
      >
        <SelectValue>
          {(v: string) => {
            const o = porValor.get(v);
            return o ? (
              <>
                {o.icone}
                {o.rotulo}
              </>
            ) : null;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-auto max-w-[calc(100vw-2rem)] min-w-(--anchor-width)">
        {opcoes.map((o) => (
          <SelectItem
            key={o.valor}
            value={o.valor}
            className="min-h-11 py-2 text-base"
          >
            {o.icone}
            {o.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
