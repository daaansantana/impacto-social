"use client";

import { usePathname } from "next/navigation";
import { Navegacao } from "@/components/shell/navegacao";

const ECRAS = [
  { href: "/", rotulo: "Portefólio", tambem: "/projetos" },
  { href: "/simulador", rotulo: "Simulador" },
  { href: "/confianca", rotulo: "Confiança" },
];

/** Lê a rota e passa-a à navegação por props. */
export function NavegacaoApp() {
  const rota = usePathname();
  return (
    <Navegacao
      itens={ECRAS.map((e) => ({
        href: e.href,
        rotulo: e.rotulo,
        ativo:
          rota === e.href ||
          (e.tambem !== undefined && rota.startsWith(e.tambem)),
      }))}
    />
  );
}
