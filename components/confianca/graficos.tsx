"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { VistaConfianca } from "@/lib/vista-confianca";

const EIXO = { fill: "var(--muted-foreground)", fontSize: 12 };
const LEGENDA = { fontSize: 12, color: "var(--foreground)" };
// Novembro e dezembro em âmbar, o resto em ardósia.
const COR_FIM_DE_ANO = "var(--lupa-ambar)";
const COR_RESTO = "var(--lupa-ardosia)";

/** Média por mês, com janeiro a outubro = 100. */
export function GraficoFimDeAno({
  dados,
  resumo,
}: {
  dados: VistaConfianca["fimDeAno"];
  resumo: string;
}) {
  return (
    <div className="h-56" role="img" aria-label={resumo}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} />
          <YAxis width={40} tick={EIXO} axisLine={false} tickLine={false} />
          <Legend wrapperStyle={LEGENDA} />
          <Bar
            dataKey="janOut"
            name="Janeiro a outubro (= 100)"
            fill={COR_RESTO}
            isAnimationActive={false}
          />
          <Bar
            dataKey="novDez"
            name="Novembro e dezembro"
            fill={COR_FIM_DE_ANO}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
