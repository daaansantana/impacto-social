import type { Dimensao } from "@/lib/vista-acao";

/** O IIS e as 4 dimensões em barras, cada uma com uma frase. */
export function Dimensoes({
  iisTexto,
  faixa,
  dimensoes,
  fonte,
}: {
  iisTexto: string;
  faixa: string;
  dimensoes: Dimensao[];
  fonte: string;
}) {
  return (
    <section
      aria-labelledby="iis"
      className="flex flex-col gap-4 rounded-lg border p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="iis" className="text-lg font-semibold">
          Índice de impacto social
        </h2>
        <p className="text-4xl font-bold tabular-nums">
          {iisTexto}
          <span className="text-base font-normal text-muted-foreground">
            {" "}
            em 100 ({faixa})
          </span>
        </p>
      </div>
      <ul className="flex flex-col gap-4">
        {dimensoes.map((d) => (
          <li key={d.id} className="flex flex-col gap-1">
            <p className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{d.titulo}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {d.valorTexto}
              </span>
            </p>
            <div aria-hidden className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${d.valor ?? 0}%` }}
              />
            </div>
            <p className="text-sm">{d.frase}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Cada barra vai de 0 a 100: a posição entre as 12 ações (a necessidade,
        entre os países com dado). Necessidade: {fonte}
      </p>
    </section>
  );
}
