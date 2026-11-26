"use client";

import { CartaoAcao } from "@/components/acoes/cartao-acao";
import { FiltrosAcoes } from "@/components/acoes/filtros";
import { Escolha } from "@/components/comum/escolha";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAcoes } from "@/hooks/use-acoes";
import type { Ordenacao } from "@/lib/acoes";

const TITULO = "As ações";

export default function AcoesPage() {
  const a = useAcoes();

  if (a.estado === "error")
    return <EstadoErro mensagem={a.erro} onTentarDeNovo={a.tentarDeNovo} />;
  if (a.estado !== "ready" || !a.vista) return <EstadoCarregar />;

  const v = a.vista;
  const filtros = (id: string) => (
    <FiltrosAcoes
      id={id}
      opcoes={{
        regiao: v.opcoes.regioes,
        pais: v.opcoes.paises,
        area: v.opcoes.areas,
        saude: v.opcoes.saude,
        confianca: v.opcoes.confianca,
      }}
      valores={a.filtros}
      onMudar={a.mudarFiltro}
      onLimpar={a.limparFiltros}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={TITULO}
        intro="Veja e compare as ações: o impacto, a saúde e a confiança nos números de cada uma."
      />
      <div className={COLUMNS}>
        <section aria-labelledby="lista" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="lista" className="text-lg font-semibold" aria-live="polite">
              {v.contagem}
            </h2>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ordem">Ordenar por</Label>
                <Escolha
                  id="ordem"
                  className="w-auto"
                  valor={a.ordem}
                  onValor={(v) => a.setOrdem(v as Ordenacao)}
                  opcoes={v.opcoes.ordenacoes}
                />
              </div>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="lg" className="lg:hidden" />
                  }
                >
                  Filtros{v.filtrosAtivos ? ` (${v.filtrosAtivos})` : ""}
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[85dvh] overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                      Escolha que ações ver. O endereço guarda a escolha, para a
                      poder partilhar.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-6">{filtros("folha")}</div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          {v.cartoes.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {v.cartoes.map((c) => (
                <li key={c.id}>
                  <CartaoAcao cartao={c} />
                </li>
              ))}
            </ul>
          ) : (
            <EstadoVazio mensagem="Nenhuma ação passa estes filtros. Limpe um filtro para ver mais." />
          )}
        </section>
        <aside
          aria-label="Filtros"
          className="hidden rounded-lg border p-4 lg:sticky lg:top-6 lg:block"
        >
          {filtros("lateral")}
        </aside>
      </div>
    </div>
  );
}
