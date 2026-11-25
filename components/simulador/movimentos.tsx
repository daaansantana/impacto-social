import type { LinhaMovimento } from "@/lib/vista-simulador";

function Lista({
  titulo,
  linhas,
  idTitulo,
}: {
  titulo: string;
  linhas: LinhaMovimento[];
  idTitulo: string;
}) {
  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-2">
      <h3 id={idTitulo} className="font-semibold">
        {titulo}
      </h3>
      <ul className="divide-y rounded-lg border">
        {linhas.map((l) => (
          <li
            key={l.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 p-3"
          >
            <span className="font-medium">{l.nome}</span>
            <span className="text-right font-semibold tabular-nums">
              {l.valor}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {l.custo}
            </span>
            <span className="text-right text-sm text-muted-foreground tabular-nums">
              {l.beneficiarios}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Quem dá e quem recebe, com o valor movido de cada um. */
export function Movimentos({
  dao,
  recebem,
  movido,
}: {
  dao: LinhaMovimento[];
  recebem: LinhaMovimento[];
  movido: string;
}) {
  return (
    <section aria-labelledby="movimentos" className="flex flex-col gap-4">
      <div>
        <h2 id="movimentos" className="text-lg font-semibold">
          Quem dá e quem recebe
        </h2>
        <p className="text-sm text-muted-foreground">
          Movem-se {movido} do investimento aprovado, em partes iguais para quem
          recebe.
        </p>
      </div>
      <Lista titulo="Dão: os 4 menos eficientes" linhas={dao} idTitulo="dao" />
      <Lista
        titulo="Recebem: os 4 mais eficientes"
        linhas={recebem}
        idTitulo="recebem"
      />
    </section>
  );
}
