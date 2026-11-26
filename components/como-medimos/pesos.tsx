"use client";

import { Deslizante } from "@/components/simulador/deslizante";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Dimensao, Pesos, Predefinicao } from "@/lib/iis";

/** As 4 predefinições e as 4 réguas de pesos. */
export function PesosIIS({
  predefinicoes,
  atual,
  onPredefinicao,
  dimensoes,
  pesos,
  partes,
  onPeso,
}: {
  predefinicoes: { id: Predefinicao; rotulo: string }[];
  atual: Predefinicao | null;
  onPredefinicao: (p: Predefinicao) => void;
  dimensoes: { id: Dimensao; titulo: string }[];
  pesos: Pesos;
  partes: Record<Dimensao, string>;
  onPeso: (d: Dimensao, v: number) => void;
}) {
  return (
    <section
      aria-labelledby="pesos"
      className="flex flex-col gap-5 rounded-lg border bg-muted/40 p-5"
    >
      <div>
        <h2 id="pesos" className="text-lg font-semibold">
          Os pesos do índice
        </h2>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Predefinições</legend>
        <ToggleGroup
          variant="outline"
          className="flex-wrap"
          value={atual ? [atual] : []}
          onValueChange={(v) => {
            if (v[0]) onPredefinicao(v[0] as Predefinicao);
          }}
        >
          {predefinicoes.map((p) => (
            <ToggleGroupItem key={p.id} value={p.id}>
              {p.rotulo}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {atual === null ? (
          <p className="text-sm text-muted-foreground">Pesos mudados à mão.</p>
        ) : null}
      </fieldset>
      {dimensoes.map((d) => (
        <Deslizante
          key={d.id}
          rotulo={d.titulo}
          valorTexto={`${pesos[d.id]} (${partes[d.id]} do índice)`}
          valor={pesos[d.id]}
          min={0}
          max={100}
          passo={5}
          onValor={(v) => onPeso(d.id, v)}
        />
      ))}
    </section>
  );
}
