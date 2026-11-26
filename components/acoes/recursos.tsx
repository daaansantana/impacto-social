/** «Recursos e resultados»: a despesa, as horas de voluntariado e os beneficiários, e a relação entre eles. */
export function Recursos({
  linhas,
  relacao,
}: {
  linhas: { rotulo: string; valor: string }[];
  relacao: string;
}) {
  return (
    <section
      aria-labelledby="recursos"
      className="flex flex-col gap-3 rounded-lg border p-5"
    >
      <h2 id="recursos" className="text-lg font-semibold">
        Recursos e resultados
      </h2>
      <p className="text-sm text-muted-foreground">De janeiro a outubro.</p>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {linhas.map((l) => (
          <div
            key={l.rotulo}
            className="flex items-baseline justify-between gap-4 border-b pb-2"
          >
            <dt className="text-muted-foreground">{l.rotulo}</dt>
            <dd className="font-semibold tabular-nums">{l.valor}</dd>
          </div>
        ))}
      </dl>
      <p>{relacao}</p>
    </section>
  );
}
