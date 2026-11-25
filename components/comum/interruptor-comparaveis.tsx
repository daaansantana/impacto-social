"use client";

import { Switch } from "@/components/ui/switch";

/** O interruptor «meses comparáveis». */
export function InterruptorComparaveis({
  rotulo,
  comparaveis,
  onComparaveis,
}: {
  rotulo: string;
  comparaveis: boolean;
  onComparaveis: (comparaveis: boolean) => void;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: o Switch é o controlo dentro da label
    <label className="flex items-center gap-3 font-medium">
      <Switch checked={comparaveis} onCheckedChange={onComparaveis} />
      {rotulo}
    </label>
  );
}
