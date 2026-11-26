"use client";

import { useState } from "react";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import {
  AConfirmar,
  AlcanceTopo,
  LegendaIIS,
  Leituras,
} from "@/components/inicio/inicio";
import { MapaAcoes } from "@/components/mapa/mapa-acoes";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useInicio } from "@/hooks/use-inicio";
import { FAIXAS_MAPA } from "@/lib/vista-inicio";

const TITULO = "Como está o impacto";

export default function InicioPage() {
  const p = useInicio();
  const [selecionado, setSelecionado] = useState<string | null>(null);

  if (p.estado === "error")
    return <EstadoErro mensagem={p.erro} onTentarDeNovo={p.tentarDeNovo} />;
  if (p.estado !== "ready") return <EstadoCarregar />;
  if (!p.vista)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Ainda não há ações com impacto calculado. Gere de novo o impacto.json com o scripts/impacto.py." />
      </div>
    );

  const v = p.vista;
  const verNoMapa = (id: string) => {
    setSelecionado(id);
    document
      .getElementById("mapa")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={TITULO} />
      <AlcanceTopo alcance={v.alcance} />
      <Leituras leituras={v.leituras} onVerNoMapa={verNoMapa} />
      <div className={COLUMNS}>
        <section
          id="mapa"
          aria-labelledby="titulo-mapa"
          className="flex scroll-mt-6 flex-col gap-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="titulo-mapa" className="text-xl font-semibold">
              As {v.pontos.length} ações
            </h2>
            <LegendaIIS faixas={FAIXAS_MAPA} />
          </div>
          <MapaAcoes
            pontos={v.pontos}
            selecionado={selecionado}
            onSelecionar={setSelecionado}
            className="h-80 sm:h-105"
          />
        </section>
        <AConfirmar itens={v.aConfirmar} />
      </div>
    </div>
  );
}
