"use client";

import { InterruptorComparaveis } from "@/components/comum/interruptor-comparaveis";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Unidade } from "@/types";

/** A unidade e o interruptor «meses comparáveis», dobrados. */
export function Escolhas({
  unidades,
  unidade,
  onUnidade,
  legenda,
  comparaveis,
  onComparaveis,
  rotuloComparaveis,
  avisoFimDeAno,
}: {
  unidades: { id: Unidade; rotulo: string }[];
  unidade: Unidade;
  onUnidade: (unidade: Unidade) => void;
  legenda: string;
  comparaveis: boolean;
  onComparaveis: (comparaveis: boolean) => void;
  rotuloComparaveis: string;
  avisoFimDeAno: string;
}) {
  return (
    <details className="group rounded-lg border">
      <summary className="cursor-pointer list-none p-4 font-medium marker:hidden">
        <span className="underline-offset-4 group-hover:underline">
          Mudar a unidade ou os meses
        </span>
      </summary>
      <div className="flex flex-col gap-5 border-t p-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-medium">Comparar</legend>
          <ToggleGroup
            variant="outline"
            className="flex-wrap"
            value={[unidade]}
            onValueChange={(valor) => {
              if (valor[0]) onUnidade(valor[0] as Unidade);
            }}
          >
            {unidades.map((u) => (
              <ToggleGroupItem key={u.id} value={u.id}>
                {u.rotulo}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-sm text-muted-foreground">{legenda}</p>
        </fieldset>
        <div className="flex flex-col gap-2">
          <InterruptorComparaveis
            rotulo={rotuloComparaveis}
            comparaveis={comparaveis}
            onComparaveis={onComparaveis}
          />
          <p className="text-sm text-muted-foreground">{avisoFimDeAno}</p>
        </div>
      </div>
    </details>
  );
}
