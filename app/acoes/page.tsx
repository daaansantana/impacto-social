"use client";

import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { Alcance } from "@/components/portefolio/alcance";
import { Escolhas } from "@/components/portefolio/escolhas";
import { Ranking } from "@/components/portefolio/ranking";
import { TotaisPortefolio } from "@/components/portefolio/totais";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { usePortefolio } from "@/hooks/use-portefolio";
import { NOTA_BENEFICIARIOS } from "@/lib/avisos";
import { ROTULO_COMPARAVEIS, UNIDADES } from "@/lib/portefolio";

const TITULO = "Onde cada euro chega a mais gente";

export default function AcoesPage() {
  const p = usePortefolio();

  if (p.estado === "error")
    return <EstadoErro mensagem={p.erro} onTentarDeNovo={p.tentarDeNovo} />;
  if (!p.vista) return <EstadoCarregar />;
  if (p.vista.linhas.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Não há meses com dados para comparar. Ligue ou desligue «meses comparáveis» para ver outros meses." />
      </div>
    );

  const v = p.vista;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={TITULO} intro={v.conclusao} emphasis>
        <p>
          <span className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {v.periodo}
          </span>
        </p>
        <Escolhas
          unidades={UNIDADES}
          unidade={p.unidade}
          onUnidade={p.setUnidade}
          legenda={v.legenda}
          comparaveis={p.comparaveis}
          onComparaveis={p.setComparaveis}
          rotuloComparaveis={ROTULO_COMPARAVEIS}
          avisoFimDeAno={v.avisoFimDeAno}
          notaBeneficiarios={NOTA_BENEFICIARIOS}
        />
      </PageHeader>
      <div className={COLUMNS}>
        <Ranking linhas={v.linhas} />
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Alcance linhas={v.linhas} grafico={v.grafico} />
          <TotaisPortefolio texto={v.totaisTexto} />
        </div>
      </div>
    </div>
  );
}
