"use client";

import { useEffect, useState } from "react";
import {
  Map as Mapa,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import type { PontoMapa } from "@/types";

/** Leva o mapa até ao ponto escolhido, sem afastar quem já está mais perto. */
function Foco({ ponto }: { ponto: PontoMapa | null }) {
  const { map } = useMap();
  useEffect(() => {
    if (!map || !ponto) return;
    map.flyTo({
      center: [ponto.longitude, ponto.latitude],
      zoom: Math.max(map.getZoom(), 3),
      essential: true,
    });
  }, [map, ponto]);
  return null;
}

/**
 * As ações no mapa: um marcador da cor de cada ponto e, ao clicar, o nome e o IIS.
 * Com `selecionado` e `onSelecionar`, quem o usa escolhe o ponto aberto (por exemplo, a partir de um cartão).
 */
export function MapaAcoes({
  pontos,
  selecionado,
  onSelecionar,
  centro = [10, 12],
  zoom = 1.3,
  className = "h-105",
}: {
  pontos: PontoMapa[];
  /** o id do ponto com o popup aberto; sem esta prop, o mapa guarda a escolha */
  selecionado?: string | null;
  onSelecionar?: (id: string | null) => void;
  /** [longitude, latitude] */
  centro?: [number, number];
  zoom?: number;
  className?: string;
}) {
  const [interno, setInterno] = useState<string | null>(null);
  const atual = selecionado !== undefined ? selecionado : interno;
  const escolher = (id: string | null) => {
    setInterno(id);
    onSelecionar?.(id);
  };
  const aberto = pontos.find((p) => p.id === atual) ?? null;
  // Com 2 ou mais pontos, o mapa abre a mostrar todos, em qualquer largura de ecrã.
  const limites: [[number, number], [number, number]] | undefined =
    pontos.length > 1
      ? [
          [
            Math.min(...pontos.map((p) => p.longitude)),
            Math.min(...pontos.map((p) => p.latitude)),
          ],
          [
            Math.max(...pontos.map((p) => p.longitude)),
            Math.max(...pontos.map((p) => p.latitude)),
          ],
        ]
      : undefined;

  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      <Mapa
        center={centro}
        zoom={zoom}
        bounds={limites}
        fitBoundsOptions={{ padding: 32 }}
        theme="light"
      >
        <MapControls showZoom />
        <Foco ponto={aberto} />
        {pontos.map((p) => (
          <MapMarker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
            onClick={() => escolher(p.id)}
          >
            <MarkerContent>
              <button
                type="button"
                aria-label={
                  p.rotulo ?? `${p.nome}: IIS ${Math.round(p.iis ?? 0)}`
                }
                aria-pressed={p.id === atual}
                className={`block rounded-full border-2 border-white shadow-md outline-none ring-offset-1 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-foreground ${p.tamanho ? "" : "size-4 aria-pressed:size-5"}`}
                style={{
                  backgroundColor: p.cor,
                  ...(p.tamanho ? { width: p.tamanho, height: p.tamanho } : {}),
                }}
              />
            </MarkerContent>
          </MapMarker>
        ))}
        {aberto ? (
          <MapPopup
            key={aberto.id}
            longitude={aberto.longitude}
            latitude={aberto.latitude}
            onClose={() => escolher(null)}
            closeButton
            // Um clique num marcador também é um clique no mapa: sem isto, o popup antigo fechava-se e apagava a nova escolha.
            closeOnClick={false}
          >
            <p className="pr-5 font-semibold">{aberto.nome}</p>
            {aberto.linhas ? (
              aberto.linhas.map((l) => (
                <p key={l} className="text-sm text-muted-foreground">
                  {l}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                IIS{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.round(aberto.iis ?? 0)}
                </span>{" "}
                em 100
              </p>
            )}
          </MapPopup>
        ) : null}
      </Mapa>
    </div>
  );
}
