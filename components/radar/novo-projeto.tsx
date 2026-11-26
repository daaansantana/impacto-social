"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { NovoProjeto } from "@/lib/radar";

type Opcao = { valor: string; rotulo: string };

/** O painel «Novo projeto» (protótipo): país, área, formato e orçamento, e a leitura com o motivo. */
export function PainelNovoProjeto({
  paises,
  areas,
  formatos,
  valores,
  onMudar,
  resultado,
  leituraTexto,
}: {
  paises: Opcao[];
  areas: Opcao[];
  formatos: string[];
  valores: { pais: string; area: string; formato: string; orcamento: number };
  onMudar: (
    campo: "pais" | "area" | "formato" | "orcamento",
    valor: string,
  ) => void;
  resultado: NovoProjeto | null;
  leituraTexto: string;
}) {
  const campo = "w-full [&_select]:h-11 [&_select]:text-base";
  return (
    <section
      aria-labelledby="novo"
      className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="novo" className="text-lg font-semibold">
          Novo projeto
        </h2>
        <Badge variant="outline" className="border-dashed">
          Protótipo
        </Badge>
      </div>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-pais">País</Label>
          <NativeSelect
            id="np-pais"
            className={campo}
            value={valores.pais}
            onChange={(e) => onMudar("pais", e.target.value)}
          >
            {paises.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-area">Área</Label>
          <NativeSelect
            id="np-area"
            className={campo}
            value={valores.area}
            onChange={(e) => onMudar("area", e.target.value)}
          >
            {areas.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-formato">Formato</Label>
          <NativeSelect
            id="np-formato"
            className={campo}
            value={valores.formato}
            onChange={(e) => onMudar("formato", e.target.value)}
          >
            {formatos.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-orcamento">Orçamento (€)</Label>
          <input
            id="np-orcamento"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            value={valores.orcamento}
            onChange={(e) => onMudar("orcamento", e.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </form>
      <div aria-live="polite" className="flex flex-col gap-2">
        {resultado ? (
          <>
            <p className="text-2xl font-bold">{leituraTexto}</p>
            <p>{resultado.motivo}</p>
            <p className="text-muted-foreground">{resultado.resumo}</p>
          </>
        ) : (
          <p className="text-muted-foreground">
            Escolha um país, uma área e um orçamento acima de 0.
          </p>
        )}
      </div>
    </section>
  );
}
