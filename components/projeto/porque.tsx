import type { Indicador } from "@/lib/vista-projeto";

/** «Porquê», dobrado: o que ajuda a explicar a eficiência. */
export function Porque({ indicadores }: { indicadores: Indicador[] }) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer p-4 font-semibold">Porquê</summary>
      <dl className="flex flex-col gap-4 border-t p-4">
        {indicadores.map((i) => (
          <div key={i.titulo}>
            <dt className="flex flex-wrap items-center gap-2 text-muted-foreground">
              {i.titulo}
              {i.etiqueta ? (
                <span className="rounded-full border border-dashed px-2 py-0.5 text-xs font-medium text-foreground">
                  {i.etiqueta}
                </span>
              ) : null}
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">{i.valor}</dd>
            <dd className="text-sm text-muted-foreground">{i.texto}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
