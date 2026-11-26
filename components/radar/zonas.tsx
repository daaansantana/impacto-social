import { Pais } from "@/components/comum/bandeira";
import type { GruposRadar } from "@/lib/radar";
import type { VistaRadar } from "@/lib/vista-radar";
import { ZONAS } from "@/lib/vista-radar";
import type { Quadrante } from "@/types";

/** As 4 zonas do quadrante, com os países de cada uma, e as células «sem dado» à parte. */
export function Zonas({
  grupos,
  pontos,
}: {
  grupos: GruposRadar;
  pontos: VistaRadar["pontos"];
}) {
  const porId = new Map(pontos.map((p) => [p.pais, p]));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {ZONAS.map((z) => (
          <section
            key={z.id}
            aria-label={z.id}
            className="rounded-lg border p-4"
          >
            <h3 className="font-semibold">{z.id}</h3>
            <p className="mb-2 text-sm text-muted-foreground">{z.texto}</p>
            {grupos[z.id as Quadrante].length ? (
              <ul className="flex flex-col gap-1 text-sm">
                {grupos[z.id as Quadrante].map((c) => (
                  <li key={c.pais}>
                    <Pais
                      pais={c.pais}
                      nome={porId.get(c.pais)?.nome ?? c.pais}
                      className="font-medium"
                    />
                    <span className="text-muted-foreground">
                      {c.estimado
                        ? `: estimado a partir de ${c.n === 1 ? "1 ação" : `${c.n} ações`}`
                        : ": com ação"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum país.</p>
            )}
          </section>
        ))}
      </div>
      {grupos.semDado.length ? (
        <section
          aria-label="Sem dado"
          className="rounded-lg border border-dashed p-4"
        >
          <h3 className="font-semibold">Sem dado</h3>
          <p className="text-sm text-muted-foreground">
            Falta o indicador da necessidade para{" "}
            {grupos.semDado.map((c, i) => (
              <span key={c.pais}>
                {i > 0 ? " e " : ""}
                <Pais pais={c.pais} nome={porId.get(c.pais)?.nome ?? c.pais} />
              </span>
            ))}
            : confirmar com dados locais.
          </p>
        </section>
      ) : null}
    </div>
  );
}
