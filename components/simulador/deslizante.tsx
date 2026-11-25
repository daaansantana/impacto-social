"use client";

import { Slider } from "@base-ui/react/slider";
import type { ReactNode } from "react";

/** Um pressuposto editável: o rótulo, o valor escrito e a régua. */
export function Deslizante({
  rotulo,
  valorTexto,
  valor,
  min,
  max,
  passo,
  onValor,
  marca,
}: {
  rotulo: string;
  valorTexto: string;
  valor: number;
  min: number;
  max: number;
  passo: number;
  onValor: (valor: number) => void;
  /** uma marca na régua, por exemplo o ponto de equilíbrio */
  marca?: { valor: number; rotulo: ReactNode };
}) {
  const posicao = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <Slider.Root
      value={[valor]}
      min={min}
      max={max}
      step={passo}
      onValueChange={(v) => onValor(Array.isArray(v) ? v[0] : (v as number))}
      className="flex flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-4">
        <Slider.Label className="font-medium">{rotulo}</Slider.Label>
        <span
          className="text-lg font-semibold whitespace-nowrap tabular-nums"
          aria-hidden
        >
          {valorTexto}
        </span>
      </div>
      <Slider.Control className="relative flex h-6 w-full touch-none items-center select-none">
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-muted">
          <Slider.Indicator className="rounded-full bg-primary" />
          <Slider.Thumb
            getAriaValueText={() => valorTexto}
            className="block size-5 rounded-full border-2 border-primary bg-background shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Slider.Track>
      </Slider.Control>
      {marca ? (
        <div
          className="relative h-10 text-xs text-muted-foreground"
          aria-hidden
        >
          <span
            className="absolute top-0 flex -translate-x-full flex-col items-end text-right"
            style={{ left: posicao(marca.valor) }}
          >
            <span className="h-2 w-px bg-foreground" />
            <span className="mt-1 whitespace-nowrap">{marca.rotulo}</span>
          </span>
        </div>
      ) : null}
    </Slider.Root>
  );
}
