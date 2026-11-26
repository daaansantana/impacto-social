import type { MesProjeto, SerieProjeto } from "@/lib/vista-projeto";

/** Os valores dos gráficos numa tabela, dobrada. */
export function TabelaMeses({
  meses,
  series,
}: {
  meses: MesProjeto[];
  series: SerieProjeto[];
}) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer p-4 font-medium">
        Ver os valores numa tabela
      </summary>
      <div className="overflow-x-auto border-t">
        <table className="w-full min-w-[30rem] text-sm tabular-nums">
          <thead>
            <tr className="border-b text-left">
              <th scope="col" className="p-2">
                Mês
              </th>
              {series.map((s) => (
                <th key={s.chave} scope="col" className="p-2 text-right">
                  {s.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m.mes} className="border-b last:border-0">
                <th scope="row" className="p-2 text-left font-normal">
                  {m.rotulo}
                  {m.fimDeAno ? " (fim de ano)" : ""}
                </th>
                {series.map((s) => (
                  <td key={s.chave} className="p-2 text-right">
                    {s.formatar(m[s.chave])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
