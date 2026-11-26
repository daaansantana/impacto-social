import { SaudeBadge } from "@/components/acoes/saude-badge";
import type { NivelSaude } from "@/types";

/** A saúde da ação: as 5 lentes, cada uma com o nível e uma frase. */
export function SaudeAcao({
  lentes,
}: {
  lentes: { lente: string; nivel: NivelSaude; frase: string }[];
}) {
  return (
    <section
      aria-labelledby="saude"
      className="flex flex-col gap-3 rounded-lg border p-5"
    >
      <h2 id="saude" className="text-lg font-semibold">
        A saúde da ação
      </h2>
      <ul className="flex flex-col divide-y">
        {lentes.map((l) => (
          <li
            key={l.lente}
            className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{l.lente}</span>
              <SaudeBadge nivel={l.nivel} />
            </div>
            <p className="text-sm text-muted-foreground">{l.frase}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
