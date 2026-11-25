import type { ReactNode } from "react";

/** As colunas por baixo do cabeçalho: a principal e a lateral. */
export const COLUMNS =
  "grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10";

/** O topo de cada ecrã: o título, uma frase e os controlos do ecrã. */
export function PageHeader({
  title,
  intro,
  emphasis = false,
  children,
}: {
  title: string;
  intro?: ReactNode;
  /** A frase é a conclusão do ecrã: maior e a negrito. */
  emphasis?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {title}
        </h1>
        {intro ? (
          <p
            className={
              emphasis
                ? "max-w-[65ch] text-xl leading-snug font-semibold text-balance"
                : "max-w-[65ch] text-lg text-muted-foreground"
            }
          >
            {intro}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
