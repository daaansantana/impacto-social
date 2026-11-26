"use client";

import { IconeArea } from "@/components/comum/area";
import { Escolha } from "@/components/comum/escolha";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { MapaRadar } from "@/components/radar/mapa-radar";
import { PainelNovoProjeto } from "@/components/radar/novo-projeto";
import { OndeFaria } from "@/components/radar/onde-faria";
import { QuadranteRadar } from "@/components/radar/quadrante-radar";
import { Zonas } from "@/components/radar/zonas";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { Label } from "@/components/ui/label";
import { useRadar } from "@/hooks/use-radar";
import { COR_SEM_DADO, CORES_NECESSIDADE } from "@/lib/vista-radar";

const TITULO = "Onde abrir ou reforçar";

export default function RadarPage() {
  const r = useRadar();

  if (r.estado === "error")
    return <EstadoErro mensagem={r.erro} onTentarDeNovo={r.tentarDeNovo} />;
  if (r.estado !== "ready" || !r.vista) return <EstadoCarregar />;
  if (r.vista.pontos.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="O radar.json não tem células. Gere-o de novo com o scripts/impacto.py." />
      </div>
    );

  const v = r.vista;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={TITULO}
        intro="A necessidade de cada país numa área, cruzada com os resultados das ações dessa área."
      >
        <div className="flex max-w-xs flex-col gap-1.5">
          <Label htmlFor="area">Área</Label>
          <Escolha
            id="area"
            valor={r.area}
            onValor={r.setArea}
            opcoes={v.opcoes.areas.map((a) => ({
              ...a,
              icone: <IconeArea area={a.valor} />,
            }))}
          />
        </div>
      </PageHeader>
      <div className={COLUMNS}>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="mapa" className="flex flex-col gap-3">
            <h2
              id="mapa"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <IconeArea area={v.area} size={22} />
              Os 12 países: {v.areaNome}
            </h2>
            <MapaRadar pontos={v.pontos} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>Necessidade:</span>
              {CORES_NECESSIDADE.map((c) => (
                <span key={c.rotulo} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-3 rounded-full"
                    style={{ backgroundColor: c.cor }}
                  />
                  {c.rotulo}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ backgroundColor: COR_SEM_DADO }}
                />
                sem dado
              </span>
              <span>O tamanho é a evidência; a tracejado, estimada.</span>
            </div>
          </section>
          <section aria-labelledby="quadrante" className="flex flex-col gap-3">
            <h2 id="quadrante" className="text-lg font-semibold">
              Necessidade e evidência
            </h2>
            <p className="text-sm text-muted-foreground">
              As linhas cortam na metade dos países (necessidade) e na mediana
              das 12 ações (evidência: {v.medianaTexto}). Os pontos a tracejado
              são estimados a partir das ações da mesma área noutros países.
            </p>
            <QuadranteRadar
              pontos={v.pontos}
              mediana={v.mediana}
              resumo={`Necessidade contra evidência em ${v.areaNome}: ${v.grupos.Reforçar.length} países a reforçar, ${v.grupos["Repensar ou apoiar"].length} a repensar ou apoiar, ${v.grupos.Manter.length} a manter, ${v.grupos.Reavaliar.length} a reavaliar e ${v.grupos.semDado.length} sem dado.`}
            />
            <Zonas grupos={v.grupos} pontos={v.pontos} />
          </section>
        </div>
        <div className="flex flex-col gap-6">
          <OndeFaria itens={v.ondeFaria} />
          <PainelNovoProjeto
            paises={v.opcoes.paises}
            areas={v.opcoes.areas}
            formatos={r.formatos}
            valores={r.novo}
            onMudar={r.mudarNovo}
            resultado={r.resultado}
            leituraTexto={r.leituraTexto}
          />
        </div>
      </div>
    </div>
  );
}
