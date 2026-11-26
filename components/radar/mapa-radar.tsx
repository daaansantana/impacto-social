"use client";

import { useState } from "react";
import { Pais } from "@/components/comum/bandeira";
import {
  Map as Mapa,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
} from "@/components/ui/map";
import type { PontoRadar } from "@/lib/vista-radar";

/** Os 12 países da área: a cor é a necessidade e o tamanho é a evidência; os estimados a tracejado. */
export function MapaRadar({
  pontos,
  className = "h-96",
}: {
  pontos: PontoRadar[];
  className?: string;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const ponto = pontos.find((p) => p.id === aberto) ?? null;
  const limites: [[number, number], [number, number]] = [
    [
      Math.min(...pontos.map((p) => p.longitude)),
      Math.min(...pontos.map((p) => p.latitude)),
    ],
    [
      Math.max(...pontos.map((p) => p.longitude)),
      Math.max(...pontos.map((p) => p.latitude)),
    ],
  ];
  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      <Mapa
        center={[10, 12]}
        zoom={1.3}
        bounds={limites}
        fitBoundsOptions={{ padding: 40 }}
        theme="light"
      >
        <MapControls showZoom />
        {pontos.map((p) => (
          <MapMarker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
            onClick={() => setAberto(p.id)}
          >
            <MarkerContent>
              <button
                type="button"
                aria-label={`${p.nome}. ${p.necessidadeTexto} ${p.evidenciaTexto}`}
                aria-pressed={p.id === aberto}
                className={`block rounded-full border-2 border-tinta shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring ${p.estimado ? "border-dashed" : ""}`}
                style={{
                  backgroundColor: p.cor,
                  width: p.tamanho,
                  height: p.tamanho,
                }}
              />
            </MarkerContent>
          </MapMarker>
        ))}
        {ponto ? (
          <MapPopup
            key={ponto.id}
            longitude={ponto.longitude}
            latitude={ponto.latitude}
            onClose={() => setAberto(null)}
            closeButton
            closeOnClick={false}
          >
            <p className="pr-5 font-semibold">
              <Pais pais={ponto.pais} nome={ponto.nome} />
            </p>
            <p className="text-sm">{ponto.necessidadeTexto}</p>
            <p className="text-sm text-muted-foreground">
              {ponto.evidenciaTexto}
            </p>
            <p className="text-sm font-medium">
              {ponto.quadrante ?? "Sem dado"}
            </p>
          </MapPopup>
        ) : null}
      </Mapa>
    </div>
  );
}
