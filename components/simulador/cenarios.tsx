"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Cenarios<C extends string>({
  cenarios,
  atual,
  onCenario,
}: {
  cenarios: { id: C; rotulo: string }[];
  atual: C | null;
  onCenario: (cenario: C) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-medium">Cenário</legend>
      <ToggleGroup
        variant="outline"
        className="flex-wrap"
        value={atual ? [atual] : []}
        onValueChange={(v) => {
          if (v[0]) onCenario(v[0] as C);
        }}
      >
        {cenarios.map((c) => (
          <ToggleGroupItem key={c.id} value={c.id}>
            {c.rotulo}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {atual === null ? (
        <p className="text-sm text-muted-foreground">
          Pressupostos mudados à mão.
        </p>
      ) : null}
    </fieldset>
  );
}
