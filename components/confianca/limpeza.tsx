import type { VistaConfianca } from "@/lib/vista-confianca";

/** O que limpámos: uma linha por regra. */
export function Limpeza({ linhas }: { linhas: VistaConfianca["limpeza"] }) {
  return (
    <section aria-labelledby="limpeza" className="flex flex-col gap-3">
      <h2 id="limpeza" className="text-lg font-semibold">
        O que limpámos
      </h2>
      <ul className="divide-y rounded-lg border">
        {linhas.map((l) => (
          <li key={l.id} className="flex flex-col gap-1 p-4">
            <p className="font-medium">{l.titulo}</p>
            <p className="text-sm tabular-nums">{l.quantidade}</p>
            <p className="text-sm text-muted-foreground">
              Regra: {l.regra}.{l.nota ? ` ${l.nota}.` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
