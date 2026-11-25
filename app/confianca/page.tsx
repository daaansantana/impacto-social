"use client";

import { Auditor } from "@/components/confianca/auditor";
import {
  GraficoFimDeAno,
  GraficoVoluntarios,
} from "@/components/confianca/graficos";
import { Limpeza } from "@/components/confianca/limpeza";
import { Notas } from "@/components/confianca/notas";
import { Padroes } from "@/components/confianca/padroes";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { FICHEIRO_DEMO, useAuditor } from "@/hooks/use-auditor";
import { useConfianca } from "@/hooks/use-confianca";

const TITULO = "Posso confiar nos números deste mês?";

export default function ConfiancaPage() {
  const c = useConfianca();
  const a = useAuditor(c.projetos);

  if (c.estado === "error")
    return <EstadoErro mensagem={c.erro} onTentarDeNovo={c.tentarDeNovo} />;
  if (c.estado !== "ready") return <EstadoCarregar />;
  if (!c.vista || c.vista.scorecard.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Não há uma avaliação da qualidade nos dados. Gere de novo o qualidade.json com o scripts/agregar.py." />
      </div>
    );

  const v = c.vista;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={TITULO} intro={v.conclusao} emphasis />
      <div className={COLUMNS}>
        <div className="flex flex-col gap-8">
          <Notas
            generica={v.notaGenerica}
            real={v.notaReal}
            scorecard={v.scorecard}
            fonte={v.fonteNotas}
          />
          <Padroes
            padroes={v.padroes}
            graficos={{
              fimDeAno: (
                <GraficoFimDeAno dados={v.fimDeAno} resumo={v.fimDeAnoResumo} />
              ),
              voluntarios: (
                <GraficoVoluntarios
                  dados={v.voluntarios}
                  resumo={v.voluntariosResumo}
                />
              ),
            }}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <Limpeza linhas={v.limpeza} />
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
    </div>
  );
}
