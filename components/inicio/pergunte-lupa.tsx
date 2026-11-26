import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PassoLupa, RespostaLupa } from "@/lib/pergunte";

const NOTA =
  "Respostas guiadas. Com uma chave, o AI SDK chama estas mesmas funções.";

function Prototipo() {
  return (
    <Badge variant="outline" className="border-dashed">
      Protótipo
    </Badge>
  );
}

/** O cartão «Pergunte à Lupa» no Início; abre uma folha com as 4 perguntas sugeridas. */
export function PergunteLupa({
  perguntas,
  escolhida,
  onEscolher,
  conversa,
}: {
  perguntas: Pick<RespostaLupa, "id" | "pergunta">[];
  escolhida: RespostaLupa["id"] | null;
  onEscolher: (id: RespostaLupa["id"]) => void;
  /** a conversa da pergunta escolhida, já a correr */
  conversa: ReactNode;
}) {
  return (
    <section
      aria-labelledby="pergunte"
      className="flex flex-col gap-3 rounded-lg border p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="pergunte" className="text-xl font-semibold">
          Pergunte à Lupa
        </h2>
        <Prototipo />
      </div>
      <p className="text-pretty text-muted-foreground">
        Quatro perguntas, respondidas com as mesmas contas do resto da app.
      </p>
      <Sheet>
        <SheetTrigger
          render={<Button variant="outline" className="h-11 w-fit text-base" />}
        >
          Fazer uma pergunta
        </SheetTrigger>
        <SheetContent
          side="right"
          className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader className="pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-lg">Pergunte à Lupa</SheetTitle>
              <Prototipo />
            </div>
            <SheetDescription>
              Escolha uma pergunta. A Lupa mostra as funções que chama e o que
              cada uma devolve.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 px-4">
            <ul
              className="flex flex-col gap-2"
              aria-label="Perguntas sugeridas"
            >
              {perguntas.map((p) => (
                <li key={p.id}>
                  <Button
                    variant={p.id === escolhida ? "secondary" : "outline"}
                    aria-pressed={p.id === escolhida}
                    onClick={() => onEscolher(p.id)}
                    className="h-auto min-h-11 w-full justify-start py-2 text-left text-base whitespace-normal"
                  >
                    {p.pergunta}
                  </Button>
                </li>
              ))}
            </ul>
            {conversa}
          </div>
          <p className="mt-auto border-t p-4 text-sm text-muted-foreground">
            {NOTA}
          </p>
        </SheetContent>
      </Sheet>
    </section>
  );
}

/** Uma resposta: a pergunta, os passos de ferramenta (a função de lib/ e o resultado) e a resposta numa frase. */
export function Conversa({
  pergunta,
  passos,
  resposta,
  pronto,
}: {
  pergunta: string;
  passos: (PassoLupa & { feito: boolean })[];
  resposta: string;
  pronto: boolean;
}) {
  return (
    <div className="flex flex-col gap-3" aria-live="polite" aria-busy={!pronto}>
      <p className="max-w-[85%] self-end rounded-lg bg-muted px-3 py-2 text-base">
        {pergunta}
      </p>
      {passos.map((p) => (
        <div
          key={p.entrada}
          className="flex flex-col gap-2 rounded-lg border p-3"
        >
          <p className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              <span className="text-muted-foreground">Ferramenta </span>
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {p.ferramenta}
              </code>
            </span>
            <span className="text-sm text-muted-foreground">
              {p.feito ? "Feito" : "A correr…"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">Com {p.entrada}.</p>
          {p.feito ? (
            <ol className="flex flex-col gap-1.5 text-sm">
              {p.resultado.map((r) => (
                <li key={r.texto}>
                  {r.texto}
                  {r.detalhes ? (
                    <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
                      {r.detalhes.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ))}
      {resposta ? (
        <p className="text-base font-medium text-pretty">{resposta}</p>
      ) : null}
    </div>
  );
}
