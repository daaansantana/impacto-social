import type { ReactNode } from "react";
import type { VistaConfianca } from "@/lib/vista-confianca";

/** Os 4 padrões escondidos, cada um com o seu número e, quando há, o gráfico. */
export function Padroes({
  padroes,
  graficos,
}: {
  padroes: VistaConfianca["padroes"];
  /** o gráfico de cada padrão, por id */
  graficos: Record<string, ReactNode>;
}) {
  return (
    <section aria-labelledby="padroes" className="flex flex-col gap-3">
      <h2 id="padroes" className="text-lg font-semibold">
        Os {padroes.length} padrões que a nota genérica não vê
      </h2>
      <ol className="flex flex-col gap-4">
        {padroes.map((p, i) => (
          <li key={p.id} className="flex flex-col gap-2 rounded-lg border p-4">
            <p className="font-semibold">
              {i + 1}. {p.titulo}
            </p>
            <p className="text-sm">{p.texto}</p>
            {p.numero ? (
              <p className="text-sm font-medium tabular-nums">{p.numero}</p>
            ) : null}
            {p.confirmar ? (
              <p className="text-sm text-muted-foreground">{p.confirmar}</p>
            ) : null}
            {graficos[p.id] ?? null}
          </li>
        ))}
      </ol>
    </section>
  );
}
