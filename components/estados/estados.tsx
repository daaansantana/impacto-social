import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** A carregar: a forma do ecrã, sem números. */
export function EstadoCarregar() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">A carregar os dados…</span>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export function EstadoErro({
  mensagem,
  onTentarDeNovo,
}: {
  mensagem?: string | null;
  onTentarDeNovo: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-4 text-destructive"
    >
      <p>{mensagem ?? "Não foi possível ler os dados."}</p>
      <Button variant="outline" onClick={onTentarDeNovo}>
        Tentar de novo
      </Button>
    </div>
  );
}

/** Sem dados para mostrar: diz o que fazer. */
export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-muted-foreground">
      {mensagem}
    </p>
  );
}
