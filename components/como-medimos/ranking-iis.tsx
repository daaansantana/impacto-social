import Link from "next/link";
import type { LinhaRanking } from "@/lib/vista-como-medimos";

/** O ranking do IIS, ao vivo com os pesos escolhidos. */
export function RankingIIS({
  linhas,
  semPesos,
}: {
  linhas: LinhaRanking[];
  semPesos: boolean;
}) {
  return (
    <section
      aria-labelledby="ranking"
      className="flex flex-col gap-3 rounded-lg border p-5"
    >
      <h2 id="ranking" className="text-lg font-semibold">
        O ranking com estes pesos
      </h2>
      {semPesos ? (
        <p className="text-muted-foreground">
          Dê peso a pelo menos uma dimensão para ver o ranking.
        </p>
      ) : (
        <ol className="flex flex-col divide-y" aria-live="polite">
          {linhas.map((l) => (
            <li
              key={l.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 py-2"
            >
              <span className="font-bold tabular-nums text-muted-foreground">
                {l.posicao}
              </span>
              <span className="min-w-0">
                <Link
                  href={`/acoes/${l.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {l.nome}
                </Link>
                <span className="block text-sm text-muted-foreground">
                  {l.onde}
                </span>
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {l.iisTexto}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
