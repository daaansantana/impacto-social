import type { VistaProjeto } from "@/lib/vista-projeto";

export function Avisos({ avisos }: { avisos: VistaProjeto["avisos"] }) {
  return (
    <section aria-labelledby="avisos" className="flex flex-col gap-3">
      <h2 id="avisos" className="text-lg font-semibold">
        Pontos de atenção
      </h2>
      <ul className="flex flex-col gap-3">
        {avisos.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-amber-600/40 bg-amber-50 p-4 dark:bg-amber-950/30"
          >
            <p className="font-semibold">{a.titulo}</p>
            <p className="text-sm">{a.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
