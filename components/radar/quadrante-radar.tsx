"use client";

import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  type TooltipContentProps,
  type TooltipValueType,
  XAxis,
  YAxis,
} from "recharts";
import { Pais } from "@/components/comum/bandeira";
import type { PontoRadar } from "@/lib/vista-radar";

const EIXO = { fill: "var(--muted-foreground)", fontSize: 12 };

function Detalhe({
  active,
  payload,
}: TooltipContentProps<TooltipValueType, string | number>) {
  const p = payload?.[0]?.payload as PontoRadar | undefined;
  if (!active || !p) return null;
  return (
    <div className="max-w-64 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-sm">
      <p className="font-semibold">
        <Pais pais={p.pais} nome={p.nome} />
      </p>
      <p>{p.necessidadeTexto}</p>
      <p className="text-muted-foreground">{p.evidenciaTexto}</p>
    </div>
  );
}

/** A necessidade contra a evidência, com as 4 zonas; os pontos estimados a tracejado. */
export function QuadranteRadar({
  pontos,
  mediana,
  resumo,
}: {
  pontos: PontoRadar[];
  mediana: number;
  resumo: string;
}) {
  const comDado = pontos.filter((p) => p.necessidade !== null);
  return (
    <div className="h-80" role="img" aria-label={resumo}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            type="number"
            dataKey="necessidade"
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={EIXO}
            label={{
              value: "Necessidade →",
              position: "insideBottom",
              offset: -16,
              fill: "var(--foreground)",
              fontSize: 12,
            }}
          />
          <YAxis
            type="number"
            dataKey="evidencia"
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            width={40}
            tick={EIXO}
            label={{
              value: "Evidência →",
              angle: -90,
              position: "insideLeft",
              fill: "var(--foreground)",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            x={50}
            stroke="var(--foreground)"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            y={mediana}
            stroke="var(--foreground)"
            strokeDasharray="4 4"
          />
          <Tooltip content={Detalhe} cursor={false} />
          <Scatter
            data={comDado}
            isAnimationActive={false}
            shape={(props: {
              cx?: number;
              cy?: number;
              payload?: PontoRadar;
            }) => (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={7}
                fill={
                  props.payload?.estimado
                    ? "var(--background)"
                    : (props.payload?.cor ?? "var(--primary)")
                }
                stroke="var(--foreground)"
                strokeWidth={1.5}
                strokeDasharray={props.payload?.estimado ? "3 2" : undefined}
              />
            )}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
