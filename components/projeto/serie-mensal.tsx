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

// Novembro e dezembro em âmbar, o resto em ardósia.
export const COR_FIM_DE_ANO = "var(--lupa-ambar)";
const COR_RESTO = "var(--lupa-ardosia)";

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
              fill={COR_RESTO}
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
    </figure>
  );
}
