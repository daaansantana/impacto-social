/** Em grande: o custo por beneficiário e a posição. */
export function Destaque({
  custo,
  posicao,
}: {
  custo: string;
  posicao: string;
}) {
  return (
    <section
      aria-label="Eficiência"
      className="flex flex-wrap items-end gap-x-10 gap-y-4 rounded-lg border p-5"
    >
      <div>
        <p className="text-5xl font-bold tracking-tight tabular-nums">
          {custo}
        </p>
        <p className="text-muted-foreground">por beneficiário</p>
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums">{posicao}</p>
        <p className="text-muted-foreground">em eficiência</p>
      </div>
    </section>
  );
}
