"use client";

import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import type { LinhaPortefolio, VistaPortefolio } from "@/lib/portefolio";

/** O alcance (beneficiários) contra a eficiência, um ponto por projeto. */
export function Alcance({
  linhas,
  grafico,
}: {
  linhas: LinhaPortefolio[];
  grafico: VistaPortefolio["grafico"];
}) {
  return (
    <section
      aria-labelledby="alcance"
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <h2 id="alcance" className="text-lg font-semibold">
        Alcance e eficiência
      </h2>
      <p className="text-sm text-muted-foreground">
        Cada ponto é um projeto. Mais à direita, chega a mais gente.
      </p>
      <div className="h-80" role="img" aria-label={grafico.resumo}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="beneficiarios"
              domain={["auto", "auto"]}
              tickFormatter={grafico.formatarX}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              label={{
                value: "Beneficiários",
                position: "insideBottom",
                offset: -16,
                fill: "var(--foreground)",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="valor"
              domain={["auto", "auto"]}
              width={52}
              tickFormatter={grafico.formatarY}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Scatter
              data={linhas}
              fill="var(--primary)"
              isAnimationActive={false}
            >
              <LabelList
                dataKey="id"
                position="top"
                fill="var(--foreground)"
                fontSize={11}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground">
        Na vertical: {grafico.eixoY}.
      </p>
    </section>
  );
}
