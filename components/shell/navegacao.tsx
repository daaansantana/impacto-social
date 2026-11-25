import Link from "next/link";

export type ItemNavegacao = { href: string; rotulo: string; ativo: boolean };

/** Os ecrãs, sempre à vista no cabeçalho. */
export function Navegacao({ itens }: { itens: ItemNavegacao[] }) {
  return (
    <nav aria-label="Principal">
      <ul className="flex gap-1">
        {itens.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              aria-current={i.ativo ? "page" : undefined}
              className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              {i.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
