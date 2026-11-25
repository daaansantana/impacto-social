import type { VistaPortefolio } from "@/lib/portefolio";

/** O impacto total, separado da eficiência. */
export function TotaisPortefolio({
  texto,
}: {
  texto: VistaPortefolio["totaisTexto"];
}) {
  const linhas = [
    ["Beneficiários", texto.beneficiarios],
    ["Despesa", texto.despesa],
    ["Custo médio por beneficiário", texto.custo],
  ];
  return (
    <section aria-labelledby="totais" className="rounded-lg border p-4">
      <h2 id="totais" className="mb-3 text-lg font-semibold">
        Os 12 projetos juntos
      </h2>
      <dl className="grid gap-3">
        {linhas.map(([rotulo, valor]) => (
          <div
            key={rotulo}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-muted-foreground">{rotulo}</dt>
            <dd className="text-lg font-semibold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
