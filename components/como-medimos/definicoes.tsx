/** As definições das dimensões, a conta, a necessidade por área e as fontes. */
export function Definicoes({
  definicoes,
  conta,
  necessidade,
  fontes,
}: {
  definicoes: { titulo: string; pergunta: string; texto: string }[];
  conta: string[];
  necessidade: {
    area: string;
    indicador: string;
    codigo: string;
    sentido: string;
  }[];
  fontes: { nome: string; url: string; uso: string }[];
}) {
  return (
    <section aria-labelledby="definicoes" className="flex flex-col gap-5">
      <h2 id="definicoes" className="text-lg font-semibold">
        As dimensões e a conta
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {definicoes.map((d) => (
          <div key={d.titulo} className="rounded-lg border p-4">
            <dt className="font-semibold">{d.titulo}</dt>
            <dd className="text-sm italic text-muted-foreground">
              {d.pergunta}
            </dd>
            <dd className="mt-1 text-sm">{d.texto}</dd>
          </div>
        ))}
      </dl>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
        {conta.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="p-3 text-left font-semibold">
            A necessidade em cada área
          </caption>
          <thead>
            <tr className="border-y text-left">
              <th scope="col" className="p-2">
                Área
              </th>
              <th scope="col" className="p-2">
                Indicador do Banco Mundial
              </th>
              <th scope="col" className="p-2">
                Sentido
              </th>
            </tr>
          </thead>
          <tbody>
            {necessidade.map((n) => (
              <tr key={n.area} className="border-b last:border-0">
                <th scope="row" className="p-2 text-left font-normal">
                  {n.area}
                </th>
                <td className="p-2">
                  {n.indicador}{" "}
                  <span className="text-muted-foreground">({n.codigo})</span>
                </td>
                <td className="p-2">{n.sentido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Fontes</h3>
        <ul className="flex flex-col gap-2 text-sm">
          {fontes.map((f) => (
            <li key={f.url}>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                {f.nome}
              </a>
              <span className="text-muted-foreground">: {f.uso}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
