"use client";

import Link from "next/link";
import { IconeArea } from "@/components/comum/area";
import { Bandeira } from "@/components/comum/bandeira";
import { Escolha } from "@/components/comum/escolha";
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
import type {
  CampoFiltro,
  CartaoAcao,
  Opcao,
  Ordenacao,
} from "@/lib/lista-acoes";
import type { NivelSaude } from "@/types";

type Campo = { chave: CampoFiltro; rotulo: string; todos: string };

/** Os filtros: o mesmo bloco serve a linha do ecrã largo e a folha do ecrã estreito. */
export function FiltrosAcoes({
  id,
  campos,
  opcoes,
  valores,
  onMudar,
  onLimpar,
  emColuna = false,
}: {
  /** prefixo dos ids, porque há dois blocos na página */
  id: string;
  campos: Campo[];
  opcoes: Record<CampoFiltro, Opcao[]>;
  valores: Partial<Record<CampoFiltro, string>>;
  onMudar: (campo: CampoFiltro, valor: string) => void;
  onLimpar: () => void;
  emColuna?: boolean;
}) {
  return (
    <form
      aria-label="Filtros"
      onSubmit={(e) => e.preventDefault()}
      className={
        emColuna
          ? "flex flex-col gap-4"
          : "grid grid-cols-2 items-end gap-3 xl:grid-cols-3"
      }
    >
      {campos.map((c) => (
        <div key={c.chave} className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor={`${id}-${c.chave}`}>{c.rotulo}</Label>
          <Escolha
            id={`${id}-${c.chave}`}
            valor={valores[c.chave] ?? ""}
            onValor={(v) => onMudar(c.chave, v)}
            opcoes={[
              { valor: "", rotulo: c.todos },
              ...opcoes[c.chave].map((o) =>
                c.chave === "area"
                  ? { ...o, icone: <IconeArea area={o.valor} /> }
                  : c.chave === "pais"
                    ? { ...o, icone: <Bandeira pais={o.valor} /> }
                    : o,
              ),
            ]}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-10"
        onClick={onLimpar}
      >
        Limpar filtros
      </Button>
    </form>
  );
}

/** O botão «Filtros» do ecrã estreito: abre uma folha lateral com os mesmos filtros. */
export function FolhaFiltros({
  ativos,
  resumo,
  children,
}: {
  ativos: number;
  resumo: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" className="h-10 lg:hidden" />}
      >
        Filtros{ativos ? ` (${ativos})` : ""}
      </SheetTrigger>
      <SheetContent side="right" className="w-[88%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription aria-live="polite">{resumo}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/** A ordenação da lista. */
export function Ordenar({
  ordenacoes,
  ordem,
  onOrdem,
}: {
  ordenacoes: Record<Ordenacao, string>;
  ordem: Ordenacao;
  onOrdem: (ordem: Ordenacao) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor="ordenar">Ordenar por</Label>
      <Escolha
        id="ordenar"
        className="sm:w-auto"
        valor={ordem}
        onValor={(v) => onOrdem(v as Ordenacao)}
        opcoes={Object.entries(ordenacoes).map(([valor, rotulo]) => ({
          valor,
          rotulo,
        }))}
      />
    </div>
  );
}

// O vermelho fica só para erros: «a rever» é âmbar.
const COR_SAUDE: Record<NivelSaude, { fundo: string; ponto: string }> = {
  forte: { fundo: "bg-menta text-tinta ring-verde/30", ponto: "bg-verde" },
  "a acompanhar": {
    fundo: "bg-muted text-tinta ring-ardosia/30",
    ponto: "bg-ardosia",
  },
  "a rever": {
    fundo: "bg-ambar-fundo text-ambar ring-ambar/30",
    ponto: "bg-ambar",
  },
};

/** A saúde da ação: a cor e sempre o texto. */
export function EtiquetaSaude({
  nivel,
  texto,
}: {
  nivel: NivelSaude;
  texto: string;
}) {
  const c = COR_SAUDE[nivel];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset ${c.fundo}`}
    >
      <span aria-hidden className={`size-2 rounded-full ${c.ponto}`} />
      <span className="sr-only">Saúde: </span>
      {texto}
    </span>
  );
}

/** Um cartão por ação; o cartão inteiro abre o detalhe. */
export function Cartao({ c }: { c: CartaoAcao }) {
  return (
    <li className="relative flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50">
      <div>
        <h3 className="font-semibold">
          <Link
            href={c.href}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {c.nome}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          {c.pais} · {c.area}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">IIS</span>
        {/* A barra é só visual: o valor está escrito ao lado. */}
        <div aria-hidden className="h-2 flex-1 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, c.iis))}%` }}
          />
        </div>
        <span className="w-8 text-right text-lg font-bold tabular-nums">
          {c.iisTexto}
          <span className="sr-only"> em 100</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <EtiquetaSaude nivel={c.saude} texto={c.saudeTexto} />
        <span className="text-sm text-muted-foreground">
          {c.confiancaTexto}
        </span>
      </div>
      {c.destaque ? (
        <p className="text-sm font-medium tabular-nums">{c.destaque}</p>
      ) : null}
    </li>
  );
}

/** A lista de cartões, ou o que fazer quando os filtros não deixam nenhuma ação. */
export function Cartoes({
  cartoes,
  onLimpar,
}: {
  cartoes: CartaoAcao[];
  onLimpar: () => void;
}) {
  if (cartoes.length === 0)
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-6 text-muted-foreground">
        <p>Nenhuma ação tem esta combinação de filtros.</p>
        <Button variant="outline" onClick={onLimpar}>
          Limpar filtros
        </Button>
      </div>
    );
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {cartoes.map((c) => (
        <Cartao key={c.projeto} c={c} />
      ))}
    </ul>
  );
}
