import Link from "next/link";
import type {
  ItemAConfirmar,
  LeituraInicio,
  VistaInicio,
} from "@/lib/vista-inicio";

/** A etiqueta dos dados de exemplo, sempre à vista enquanto não chegam os dados reais. */
export function EtiquetaExemplo() {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-dashed px-3 py-1 text-sm font-medium text-muted-foreground">
      Dados de exemplo
    </span>
  );
}

/** A resposta em grande: os beneficiários por mês e a parte onde a necessidade é alta. */
export function AlcanceTopo({ alcance }: { alcance: VistaInicio["alcance"] }) {
  return (
    <section aria-labelledby="alcance" className="flex flex-col gap-3">
      <h2 id="alcance" className="sr-only">
        Alcance do portefólio
      </h2>
      <dl className="flex flex-wrap gap-x-12 gap-y-4">
        <div className="flex flex-col">
          <dt className="order-2 text-muted-foreground">
            beneficiários por mês
          </dt>
          <dd className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {alcance.beneficiarios}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="order-2 text-muted-foreground">
            onde a necessidade é alta
          </dt>
          <dd className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
            {alcance.percentagem}
          </dd>
        </div>
      </dl>
      <p className="text-xl font-semibold text-balance">{alcance.frase}</p>
    </section>
  );
}

/** As 3 leituras, uma frase por cartão, com o link para a ação ou o ponto no mapa. */
export function Leituras({
  leituras,
  onVerNoMapa,
}: {
  leituras: LeituraInicio[];
  onVerNoMapa: (id: string) => void;
}) {
  return (
    <section aria-labelledby="leituras" className="flex flex-col gap-3">
      <h2 id="leituras" className="sr-only">
        Três leituras
      </h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {leituras.map((l) => (
          <li key={l.id} className="flex flex-col gap-3 rounded-lg border p-4">
            <p className="text-sm font-medium text-muted-foreground">
              {l.titulo}
            </p>
            <p className="flex-1 text-pretty">{l.texto}</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
              <Link
                href={l.ligacao.href}
                className="underline underline-offset-4 hover:no-underline"
              >
                {l.ligacao.rotulo}
              </Link>
              {l.noMapa ? (
                <button
                  type="button"
                  onClick={() => l.noMapa && onVerNoMapa(l.noMapa)}
                  className="cursor-pointer underline underline-offset-4 hover:no-underline"
                >
                  Ver no mapa
                </button>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** A legenda do mapa: as faixas do IIS, com a cor e o texto. */
export function LegendaIIS({
  faixas,
}: {
  faixas: readonly { rotulo: string; cor: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">IIS</span>
      {faixas.map((f) => (
        <span key={f.rotulo} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-3 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: f.cor }}
          />
          {f.rotulo}
        </span>
      ))}
    </div>
  );
}

/** «A confirmar com os parceiros»: até 3 ações, com uma frase curta por ação. */
export function AConfirmar({ itens }: { itens: ItemAConfirmar[] }) {
  return (
    <section aria-labelledby="a-confirmar" className="flex flex-col gap-3">
      <h2 id="a-confirmar" className="text-xl font-semibold">
        A confirmar com os parceiros
      </h2>
      {itens.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma ação tem pontos a confirmar.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {itens.map((i) => (
            <li
              key={i.projeto}
              className="relative flex flex-col gap-1 p-4 hover:bg-muted/50"
            >
              <p className="font-semibold">
                <Link
                  href={i.href}
                  className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {i.nome}
                </Link>{" "}
                <span className="font-normal text-muted-foreground">
                  {i.onde}
                </span>
              </p>
              <p className="text-pretty">{i.texto}</p>
              {i.mais ? (
                <p className="text-sm text-muted-foreground">{i.mais}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
