"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { MesProjeto, SerieProjeto } from "@/lib/vista-projeto";

export const COR_FIM_DE_ANO = "#c2410c";

/** Uma medida mês a mês, com novembro e dezembro noutra cor. */
export function SerieMensal({
  meses,
  serie,
}: {
  meses: MesProjeto[];
  serie: SerieProjeto;
}) {
  const dados = meses.map((m) => ({
    rotulo: m.rotulo,
    normal: m.fimDeAno ? null : m[serie.chave],
    fimDeAno: m.fimDeAno ? m[serie.chave] : null,
  }));
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-semibold">{serie.titulo}</figcaption>
      <div className="h-44" role="img" aria-label={serie.resumo}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="rotulo"
              interval={5}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              width={64}
              tickFormatter={serie.formatar}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Bar
              dataKey="normal"
              stackId="m"
              fill="var(--primary)"
              isAnimationActive={false}
            />
            <Bar
              dataKey="fimDeAno"
              stackId="m"
              fill={COR_FIM_DE_ANO}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {serie.aviso ? (
        <p className="rounded-md border border-amber-600/40 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/30">
          {serie.aviso}
        </p>
      ) : null}
    </figure>
  );
}
