"use client";

import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { Cenarios } from "@/components/simulador/cenarios";
import { Movimentos } from "@/components/simulador/movimentos";
import { Pressupostos } from "@/components/simulador/pressupostos";
import { Resultado } from "@/components/simulador/resultado";
import { useSimulador } from "@/hooks/use-simulador";
import { CENARIOS, type Cenario } from "@/lib/simulador";
import { FATOR, FRACAO } from "@/lib/vista-simulador";

const TITULO = "Quantas pessoas a mais com o mesmo dinheiro";
const LISTA_CENARIOS = (Object.keys(CENARIOS) as Cenario[]).map((id) => ({
  id,
  rotulo: CENARIOS[id].rotulo,
}));

export default function SimuladorPage() {
  const s = useSimulador();

  if (s.estado === "error")
    return <EstadoErro mensagem={s.erro} onTentarDeNovo={s.tentarDeNovo} />;
  if (s.estado !== "ready") return <EstadoCarregar />;
  if (!s.vista || s.vista.dao.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Não há projetos com investimento aprovado para simular." />
      </div>
    );

  const v = s.vista;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={TITULO} intro={v.conclusao} emphasis />
      <div className={COLUMNS}>
        <div className="flex flex-col gap-6">
          <Resultado
            beneficiarios={v.beneficiarios}
            valor={v.valor}
            valorLegenda={v.valorLegenda}
            compensa={v.compensa}
          />
          <Cenarios
            cenarios={LISTA_CENARIOS}
            atual={v.cenario}
            onCenario={s.escolherCenario}
          />
          <Pressupostos
            fracao={v.fracao}
            fracaoTexto={v.fracaoTexto}
            onFracao={s.setFracao}
            reguaFracao={FRACAO}
            fator={v.fator}
            fatorTexto={v.fatorTexto}
            onFator={s.setFator}
            reguaFator={FATOR}
            equilibrio={v.equilibrio}
            equilibrioTexto={v.equilibrioTexto}
            fixos={v.pressupostos}
          />
        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          {v.avisoCapacidade ? (
            <p
              role="note"
              className="rounded-lg border border-amber-600/40 bg-amber-50 p-4 text-sm dark:bg-amber-950/30"
            >
              <strong className="block">Capacidade dos parceiros</strong>
              {v.avisoCapacidade}
            </p>
          ) : null}
          <Movimentos dao={v.dao} recebem={v.recebem} movido={v.movido} />
        </div>
      </div>
    </div>
  );
}
