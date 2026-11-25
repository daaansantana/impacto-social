"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { VistaConfianca } from "@/lib/vista-confianca";

const EIXO = { fill: "var(--muted-foreground)", fontSize: 12 };
const LEGENDA = { fontSize: 12, color: "var(--foreground)" };
const COR_FIM_DE_ANO = "#c2410c";

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
            fill="var(--primary)"
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

/** Voluntários registados nas alocações contra os reportados pelos parceiros. */
export function GraficoVoluntarios({
  dados,
  resumo,
}: {
  dados: VistaConfianca["voluntarios"];
  resumo: string;
}) {
  return (
    <div className="h-56" role="img" aria-label={resumo}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dados}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="rotulo" interval={5} tick={EIXO} tickLine={false} />
          <YAxis width={44} tick={EIXO} axisLine={false} tickLine={false} />
          <Legend wrapperStyle={LEGENDA} />
          <Line
            dataKey="registados"
            name="Registados"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="reportados"
            name="Reportados"
            stroke={COR_FIM_DE_ANO}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
