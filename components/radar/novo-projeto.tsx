"use client";

import { IconeArea } from "@/components/comum/area";
import { Escolha } from "@/components/comum/escolha";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
          <Escolha
            id="np-pais"
            valor={valores.pais}
            onValor={(v) => onMudar("pais", v)}
            opcoes={paises}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-area">Área</Label>
          <Escolha
            id="np-area"
            valor={valores.area}
            onValor={(v) => onMudar("area", v)}
            opcoes={areas.map((a) => ({
              ...a,
              icone: <IconeArea area={a.valor} />,
            }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-formato">Formato</Label>
          <Escolha
            id="np-formato"
            valor={valores.formato}
            onValor={(v) => onMudar("formato", v)}
            opcoes={formatos.map((f) => ({ valor: f, rotulo: f }))}
          />
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
