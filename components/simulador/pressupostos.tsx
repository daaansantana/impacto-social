"use client";

import { Deslizante } from "@/components/simulador/deslizante";

type Regua = { min: number; max: number; passo: number };

/** «Pressupostos», sempre à vista: os dois editáveis e os fixos. */
export function Pressupostos({
  fracao,
  fracaoTexto,
  onFracao,
  reguaFracao,
  fator,
  fatorTexto,
  onFator,
  reguaFator,
  equilibrio,
  equilibrioTexto,
  fixos,
}: {
  fracao: number;
  fracaoTexto: string;
  onFracao: (v: number) => void;
  reguaFracao: Regua;
  fator: number;
  fatorTexto: string;
  onFator: (v: number) => void;
  reguaFator: Regua;
  equilibrio: number;
  equilibrioTexto: string;
  fixos: string[];
}) {
  return (
    <section
      aria-labelledby="pressupostos"
      className="flex flex-col gap-5 rounded-lg border bg-muted/40 p-5"
    >
      <h2 id="pressupostos" className="text-lg font-semibold">
        Pressupostos
      </h2>
      <Deslizante
        rotulo="Parte do investimento que se move"
        valorTexto={fracaoTexto}
        valor={fracao}
        min={reguaFracao.min}
        max={reguaFracao.max}
        passo={reguaFracao.passo}
        onValor={onFracao}
      />
      <Deslizante
        rotulo="Quanto custa um beneficiário a mais, face à média"
        valorTexto={fatorTexto}
        valor={fator}
        min={reguaFator.min}
        max={reguaFator.max}
        passo={reguaFator.passo}
        onValor={onFator}
        marca={{
          valor: equilibrio,
          rotulo: <>Equilíbrio: {equilibrioTexto}</>,
        }}
      />
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
        {fixos.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>
  );
}
