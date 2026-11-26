import { IconeArea } from "@/components/comum/area";

/** «Onde faria mais diferença»: as células Reforçar que ainda não têm ação. */
export function OndeFaria({
  itens,
}: {
  itens: { id: string; area: string; titulo: string; texto: string }[];
}) {
  return (
    <section
      aria-labelledby="onde"
      className="flex flex-col gap-3 rounded-lg border p-5"
    >
      <h2 id="onde" className="text-lg font-semibold">
        Onde faria mais diferença
      </h2>
      <p className="text-sm text-muted-foreground">
        Em todas as áreas: onde há muita necessidade, a área dá resultados
        noutros países e ainda não há ação.
      </p>
      {itens.length ? (
        <ol className="flex list-decimal flex-col gap-3 pl-5">
          {itens.map((i) => (
            <li key={i.id}>
              <p className="inline-flex items-center gap-2 font-medium">
                <IconeArea area={i.area} />
                {i.titulo}
              </p>
              <p className="text-sm text-muted-foreground">{i.texto}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground">
          Nenhuma célula Reforçar sem ação.
        </p>
      )}
    </section>
  );
}
