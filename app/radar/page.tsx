"use client";

import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { MapaAcoes } from "@/components/mapa/mapa-acoes";
import {
  LegendaRadar,
  ListaDiferenca,
  NovoProjetoPainel,
  QuadranteRadar,
  SeletorArea,
} from "@/components/radar/radar";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useRadar } from "@/hooks/use-radar";
import {
  COR_SEM_DADO,
  FAIXAS_NECESSIDADE,
  LEGENDA_EVIDENCIA,
  ZONAS,
} from "@/lib/vista-radar";

const TITULO = "Onde abrir ou reforçar";

export default function RadarPage() {
  const r = useRadar();

  if (r.estado === "error")
    return <EstadoErro mensagem={r.erro} onTentarDeNovo={r.tentarDeNovo} />;
  if (r.estado !== "ready") return <EstadoCarregar />;
  if (!r.vista || r.vista.pontos.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="O Radar ainda não tem dados para esta área." />
      </div>
    );

  const v = r.vista;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={TITULO}
        intro="A necessidade de cada país, cruzada com a evidência das ações da mesma área."
      >
        <SeletorArea areas={r.areas} area={r.area} onArea={r.setArea} />
      </PageHeader>
      <div className={COLUMNS}>
        <div className="flex flex-col gap-8">
          <section aria-labelledby="mapa-radar" className="flex flex-col gap-3">
            <h2 id="mapa-radar" className="text-xl font-semibold">
              Os 12 países, em {v.areaNome}
            </h2>
            <LegendaRadar
              faixas={FAIXAS_NECESSIDADE}
              semDado={COR_SEM_DADO}
              tamanhos={LEGENDA_EVIDENCIA}
            />
            <MapaAcoes
              key={v.area}
              pontos={v.pontos}
              className="h-80 sm:h-105"
            />
          </section>
          <section aria-labelledby="quadrante" className="flex flex-col gap-3">
            <h2 id="quadrante" className="text-xl font-semibold">
              Necessidade × evidência
            </h2>
            <QuadranteRadar quadrante={v.quadrante} zonas={ZONAS} />
          </section>
          <section aria-labelledby="diferenca" className="flex flex-col gap-3">
            <h2 id="diferenca" className="text-xl font-semibold">
              Onde faria mais diferença
            </h2>
            <ListaDiferenca linhas={v.lista} notaEstimado={v.notaEstimado} />
          </section>
        </div>
        <div className="lg:sticky lg:top-6">
          <NovoProjetoPainel
            paises={r.paises}
            areas={r.areas}
            areaInicial={r.area}
            onCalcular={r.calcular}
            resultado={r.resultado}
            calculado={r.entrada !== null}
          />
        </div>
      </div>
    </div>
  );
}
