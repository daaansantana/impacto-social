import type { Indicador } from "@/lib/vista-projeto";

/** «Porquê», dobrado: o que ajuda a explicar a eficiência. */
export function Porque({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer p-4 font-semibold">Porquê</summary>
      <dl className="flex flex-col gap-4 border-t p-4">
        {indicadores.map((i) => (
          <div key={i.titulo}>
            <dt className="text-muted-foreground">{i.titulo}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{i.valor}</dd>
            <dd className="text-sm text-muted-foreground">{i.texto}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
