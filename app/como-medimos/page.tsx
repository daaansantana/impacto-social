"use client";

import { Definicoes } from "@/components/como-medimos/definicoes";
import { PesosIIS } from "@/components/como-medimos/pesos";
import { RankingIIS } from "@/components/como-medimos/ranking-iis";
import { Auditor } from "@/components/confianca/auditor";
import { GraficoFimDeAno } from "@/components/confianca/graficos";
import { Limpeza } from "@/components/confianca/limpeza";
import { Notas } from "@/components/confianca/notas";
import { Padroes } from "@/components/confianca/padroes";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { FICHEIRO_DEMO } from "@/hooks/use-auditor";
import { useComoMedimos } from "@/hooks/use-como-medimos";
import { PREDEFINICOES, type Predefinicao } from "@/lib/iis";
import {
  CONTA,
  DEFINICOES,
  DIMENSOES,
  FONTES,
  NECESSIDADE_POR_AREA,
  NOTA_INDICE,
} from "@/lib/vista-como-medimos";

const TITULO = "Como medimos";
const LISTA = (Object.keys(PREDEFINICOES) as Predefinicao[]).map((id) => ({
  id,
  rotulo: PREDEFINICOES[id].rotulo,
}));

export default function ComoMedimosPage() {
  const c = useComoMedimos();

  if (c.estado === "error")
    return <EstadoErro mensagem={c.erro} onTentarDeNovo={c.tentarDeNovo} />;
  if (c.estado !== "ready" || !c.vista) return <EstadoCarregar />;
  if (c.vista.ranking.length === 0 && !c.vista.semPesos)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Não há ações com o índice calculado. Gere de novo o impacto.json com o scripts/impacto.py." />
      </div>
    );

  const v = c.vista;
  const a = c.auditor;
  return (
    <div className="flex flex-col gap-10">
      <PageHeader title={TITULO} intro={NOTA_INDICE} />
      <div className={COLUMNS}>
        <PesosIIS
          predefinicoes={LISTA}
          atual={v.predefinicao}
          onPredefinicao={c.escolherPredefinicao}
          dimensoes={DIMENSOES}
          pesos={c.pesos}
          partes={v.partes}
          onPeso={c.mudarPeso}
        />
        <div className="lg:sticky lg:top-6">
          <RankingIIS linhas={v.ranking} semPesos={v.semPesos} />
        </div>
      </div>
      <Definicoes
        definicoes={DEFINICOES}
        conta={CONTA}
        necessidade={NECESSIDADE_POR_AREA}
        fontes={FONTES}
      />

      <section
        aria-labelledby="confianca"
        className="flex flex-col gap-6 border-t pt-8"
      >
        <div>
          <h2 id="confianca" className="text-2xl font-bold">
            A confiança nos dados
          </h2>
          <p className="max-w-[65ch] text-muted-foreground">
            {v.confianca.conclusao}
          </p>
        </div>
        <div className={COLUMNS}>
          <div className="flex flex-col gap-8">
            <Notas
              generica={v.confianca.notaGenerica}
              real={v.confianca.notaReal}
              scorecard={v.confianca.scorecard}
              fonte={v.confianca.fonteNotas}
            />
            <Padroes
              padroes={v.confianca.padroes}
              graficos={{
                fimDeAno: (
                  <GraficoFimDeAno
                    dados={v.confianca.fimDeAno}
                    resumo={v.confianca.fimDeAnoResumo}
                  />
                ),
              }}
            />
          </div>
          <div className="lg:sticky lg:top-6">
            <Limpeza linhas={v.confianca.limpeza} />
          </div>
        </div>
        <Auditor
          estado={a.estado}
          ficheiro={"ficheiro" in a ? a.ficheiro : undefined}
          erro={a.estado === "erro" ? a.erro : undefined}
          vista={a.estado === "pronto" ? a.vista : undefined}
          ficheiroDemo={FICHEIRO_DEMO}
          onFicheiro={a.lerFicheiro}
          onExperimentar={a.experimentar}
          onLimpar={a.limpar}
        />
      </section>
    </div>
  );
}
