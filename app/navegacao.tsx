"use client";

import { usePathname } from "next/navigation";
import { Navegacao } from "@/components/shell/navegacao";

const ECRAS = [
  { href: "/", rotulo: "Início" },
  { href: "/acoes", rotulo: "Ações" },
  { href: "/radar", rotulo: "Radar" },
  { href: "/como-medimos", rotulo: "Como medimos" },
];

/** A mesma navegação, sem separador marcado: o fallback enquanto a rota não é conhecida. */
export function NavegacaoSemRota() {
  return (
    <Navegacao
      itens={ECRAS.map((e) => ({
        href: e.href,
        rotulo: e.rotulo,
        ativo: false,
      }))}
    />
  );
}

/** Lê a rota e passa-a à navegação por props. O detalhe de uma ação fica em Ações. */
export function NavegacaoApp() {
  const rota = usePathname();
  return (
    <Navegacao
      itens={ECRAS.map((e) => ({
        href: e.href,
        rotulo: e.rotulo,
        ativo: e.href === "/" ? rota === "/" : rota.startsWith(e.href),
      }))}
    />
  );
}
