/** Em grande: os beneficiários a mais por ano e o valor equivalente. */
export function Resultado({
  beneficiarios,
  valor,
  valorLegenda,
  compensa,
}: {
  beneficiarios: string;
  valor: string;
  valorLegenda: string;
  compensa: boolean;
}) {
  return (
    <section
      aria-label="Resultado"
      aria-live="polite"
      className="flex flex-wrap items-end gap-x-10 gap-y-4 rounded-lg border p-5"
    >
      <div>
        <p
          className={`text-5xl font-bold tracking-tight tabular-nums ${compensa ? "" : "text-destructive"}`}
        >
          {beneficiarios}
        </p>
        <p className="text-muted-foreground">beneficiários por ano</p>
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums">{valor}</p>
        <p className="text-muted-foreground">{valorLegenda}</p>
      </div>
    </section>
  );
}
