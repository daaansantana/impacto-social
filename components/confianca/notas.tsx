import type { VistaConfianca } from "@/lib/vista-confianca";

function Pontos({ nota }: { nota: number }) {
  return (
    <span aria-hidden className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`size-2.5 rounded-full ${i <= nota ? "bg-foreground" : "bg-muted-foreground/25"}`}
        />
      ))}
    </span>
  );
}

/** Em grande: a nota genérica ao lado da nota real, por dimensão. */
export function Notas({
  generica,
  real,
  scorecard,
}: {
  generica: VistaConfianca["notaGenerica"];
  real: string;
  scorecard: VistaConfianca["scorecard"];
}) {
  return (
    <section aria-labelledby="notas" className="flex flex-col gap-4">
      <h2 id="notas" className="sr-only">
        A nota dos dados
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-5">
          <p className="text-sm text-muted-foreground">A validação genérica</p>
          <p className="text-6xl font-bold">{generica.nota}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {generica.resultado}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {generica.ferramenta}
          </p>
        </div>
        <div className="rounded-lg border border-foreground p-5">
          <p className="text-sm text-muted-foreground">Olhando de perto</p>
          <p className="flex items-baseline gap-2">
            <span className="text-6xl font-bold whitespace-nowrap tabular-nums">
              {real}
            </span>
            <span className="text-xl font-semibold">em 5</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A nota de cada dimensão está por baixo, com a evidência dobrada.
          </p>
        </div>
      </div>
      <ul className="divide-y rounded-lg border">
        {scorecard.map((s) => (
          <li key={s.dimensao}>
            <details className="group p-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <span className="font-medium">{s.dimensao}</span>
                <span className="flex items-center gap-3">
                  <Pontos nota={s.nota} />
                  <span className="font-semibold tabular-nums">
                    {s.notaTexto}
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.evidencia}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
