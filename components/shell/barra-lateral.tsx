import type { IconProps } from "@solar-icons/react";
import {
  HamburgerMenuIcon,
  Logout2Icon,
  StarsMinimalisticIcon,
} from "@solar-icons/react/linear";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ItemNavegacao = {
  href: string;
  rotulo: string;
  icone: ComponentType<IconProps>;
  ativo: boolean;
};

type Props = {
  itens: ItemNavegacao[];
  onPergunte: () => void;
  /** a folha da navegação no telemóvel */
  menuAberto: boolean;
  onMenuAberto: (aberto: boolean) => void;
};

/** Sobre a tinta, o foco passa a lima. */
const ESCURO =
  "bg-sidebar text-sidebar-foreground [--ring:var(--sidebar-ring)] [color-scheme:dark]";

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo-lupa-escuro.svg"
        alt=""
        width={compacta ? 32 : 40}
        height={compacta ? 32 : 40}
      />
      <div className="flex flex-col">
        <span className="text-xl leading-tight font-bold text-white">Lupa</span>
        {compacta ? null : (
          <span className="text-sm leading-snug text-balance text-lima">
            O impacto social das 12 ações
          </span>
        )}
      </div>
    </div>
  );
}

/** Quem entrou: só como referência, o protótipo não tem autenticação. */
function QuemEntrou() {
  return (
    <div className="flex items-center gap-3 border-t border-sidebar-border pt-4">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-menta text-sm font-semibold text-tinta"
      >
        HD
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">Helena Duarte</p>
        <p className="truncate text-sm">Gestora do programa</p>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-disabled="true"
              aria-describedby="sair-nota"
              onClick={(e) => e.preventDefault()}
              className="flex size-11 shrink-0 cursor-not-allowed items-center justify-center rounded-lg text-sidebar-foreground/70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <Logout2Icon size={22} />
          <span className="sr-only">Sair</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-sm">
          Protótipo: sem autenticação
        </TooltipContent>
      </Tooltip>
      <span id="sair-nota" className="sr-only">
        Protótipo: sem autenticação
      </span>
    </div>
  );
}

function Conteudo({
  itens,
  onPergunte,
  onNavegar,
}: Pick<Props, "itens" | "onPergunte"> & { onNavegar?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 p-4">
      <div className="px-2 pt-2">
        <Marca />
      </div>
      <nav aria-label="Principal">
        <ul className="flex flex-col gap-1">
          {itens.map(({ href, rotulo, icone: Icone, ativo }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavegar}
                aria-current={ativo ? "page" : undefined}
                className="relative flex h-11 items-center gap-3 rounded-lg px-3 text-base font-medium outline-none hover:bg-sidebar-accent/60 hover:text-white focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2 aria-[current=page]:before:-left-4 aria-[current=page]:before:w-1 aria-[current=page]:before:rounded-r-full aria-[current=page]:before:bg-sidebar-primary"
              >
                <Icone size={22} />
                {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Button
        onClick={onPergunte}
        className="h-11 gap-2 bg-sidebar-primary text-base text-sidebar-primary-foreground hover:bg-sidebar-primary/85"
      >
        <StarsMinimalisticIcon size={22} />
        Pergunte à Lupa
      </Button>
      <div className="mt-auto">
        <QuemEntrou />
      </div>
    </div>
  );
}

/** A navegação: uma barra lateral escura no computador; no telemóvel, um topo com o menu numa folha. */
export function BarraLateral({
  itens,
  onPergunte,
  menuAberto,
  onMenuAberto,
}: Props) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden w-64 overflow-y-auto xl:block ${ESCURO}`}
      >
        <Conteudo itens={itens} onPergunte={onPergunte} />
      </aside>
      <div
        className={`flex h-16 items-center justify-between px-4 xl:hidden ${ESCURO}`}
      >
        <Link
          href="/"
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Marca compacta />
        </Link>
        <Sheet open={menuAberto} onOpenChange={onMenuAberto}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-lg outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <HamburgerMenuIcon size={26} />
            <span className="sr-only">Abrir o menu</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={`gap-0 border-sidebar-border data-[side=left]:w-72 ${ESCURO}`}
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Conteudo
              itens={itens}
              onPergunte={onPergunte}
              onNavegar={() => onMenuAberto(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
