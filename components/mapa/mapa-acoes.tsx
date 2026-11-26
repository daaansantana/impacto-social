"use client";

import {
  Map as Mapa,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import type { PontoMapa } from "@/types";

/** As ações no mapa: um marcador da cor de cada ponto e, ao clicar, o nome e o IIS. */
export function MapaAcoes({
  pontos,
  centro = [10, 12],
  zoom = 1.3,
  className = "h-[420px]",
}: {
  pontos: PontoMapa[];
  /** [longitude, latitude] */
  centro?: [number, number];
  zoom?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      <Mapa center={centro} zoom={zoom} theme="light">
        <MapControls showZoom />
        {pontos.map((p) => (
          <MapMarker key={p.id} longitude={p.longitude} latitude={p.latitude}>
            <MarkerContent>
              <button
                type="button"
                aria-label={`${p.nome}: IIS ${Math.round(p.iis)}`}
                className="block size-4 rounded-full border-2 border-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: p.cor }}
              />
            </MarkerContent>
            <MarkerPopup closeButton>
              <p className="pr-5 font-semibold">{p.nome}</p>
              <p className="text-sm text-muted-foreground">
                IIS{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.round(p.iis)}
                </span>{" "}
                de 100
              </p>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Mapa>
    </div>
  );
}
