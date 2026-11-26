"use client";

import {
  ChecklistMinimalisticIcon,
  HomeIcon,
  RadarIcon,
  RulerPenIcon,
} from "@solar-icons/react/linear";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarraLateral } from "@/components/shell/barra-lateral";
import { useAbrirPergunte } from "@/hooks/use-pergunte";

const ECRAS = [
  { href: "/", rotulo: "Início", icone: HomeIcon },
  { href: "/acoes", rotulo: "Ações", icone: ChecklistMinimalisticIcon },
  { href: "/radar", rotulo: "Radar", icone: RadarIcon },
  { href: "/como-medimos", rotulo: "Como medimos", icone: RulerPenIcon },
];

const ativo = (href: string, rota: string | null) =>
  rota !== null && (href === "/" ? rota === "/" : rota.startsWith(href));

function Barra({ rota }: { rota: string | null }) {
  const abrirPergunte = useAbrirPergunte();
  const [menuAberto, setMenuAberto] = useState(false);
  return (
    <BarraLateral
      itens={ECRAS.map((e) => ({ ...e, ativo: ativo(e.href, rota) }))}
      menuAberto={menuAberto}
      onMenuAberto={setMenuAberto}
      onPergunte={() => {
        setMenuAberto(false);
        abrirPergunte();
      }}
    />
  );
}

/** A mesma navegação, sem separador marcado: o fallback enquanto a rota não é conhecida. */
export function NavegacaoSemRota() {
  return <Barra rota={null} />;
}

/** Lê a rota e passa-a à navegação por props. O detalhe de uma ação fica em Ações. */
export function NavegacaoApp() {
  return <Barra rota={usePathname()} />;
}
