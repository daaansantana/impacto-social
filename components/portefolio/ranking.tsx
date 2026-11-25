import type { LinhaPortefolio } from "@/lib/portefolio";

/** O ranking de eficiência: a posição, o projeto, o valor e o alcance. */
export function Ranking({ linhas }: { linhas: LinhaPortefolio[] }) {
  const maior = Math.max(...linhas.map((l) => l.valor));
  return (
    <section aria-labelledby="ranking" className="flex flex-col gap-3">
      <h2 id="ranking" className="text-xl font-semibold">
        Os 12 projetos, do mais eficiente ao menos
      </h2>
      <ol className="divide-y rounded-lg border">
        {linhas.map((l) => (
          <li
            key={l.id}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 p-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <span className="text-2xl font-bold text-muted-foreground tabular-nums">
              {l.posicao}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">
                {l.nome}{" "}
                <span className="font-normal text-muted-foreground">
                  {l.onde}
                </span>
              </p>
              <div aria-hidden className="mt-2 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(l.valor / maior) * 100}%` }}
                />
              </div>
            </div>
            <div className="col-start-2 sm:col-start-auto sm:text-right">
              <p className="font-semibold tabular-nums">{l.valorTexto}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {l.alcanceTexto}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
