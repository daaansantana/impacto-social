"use client";

import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import {
  Cartoes,
  FiltrosAcoes,
  FolhaFiltros,
  Ordenar,
} from "@/components/lista-acoes/lista-acoes";
import { Alcance } from "@/components/portefolio/alcance";
import { Escolhas } from "@/components/portefolio/escolhas";
import { TotaisPortefolio } from "@/components/portefolio/totais";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useListaAcoes } from "@/hooks/use-lista-acoes";
import { usePortefolio } from "@/hooks/use-portefolio";
import { NOTA_BENEFICIARIOS } from "@/lib/avisos";
import { CAMPOS_FILTRO, ORDENACOES } from "@/lib/lista-acoes";
import { ROTULO_COMPARAVEIS, UNIDADES } from "@/lib/portefolio";

const TITULO = "Onde cada euro chega a mais gente";

/** O ecrã Ações: os cartões com filtros e ordenação, ao lado do gráfico «Alcance e eficiência». */
export function EcraAcoes() {
  const p = usePortefolio();
  const l = useListaAcoes();

  if (p.estado === "error")
    return <EstadoErro mensagem={p.erro} onTentarDeNovo={p.tentarDeNovo} />;
  if (!p.vista || !l.lista || !l.selecao) return <EstadoCarregar />;
  if (p.vista.linhas.length === 0 || l.lista.opcoes.pais.length === 0)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={TITULO} />
        <EstadoVazio mensagem="Não há ações com dados para comparar. Ligue ou desligue «meses comparáveis» para ver outros meses." />
      </div>
    );

  const v = p.vista;
  const lista = l.lista;
  const filtros = (id: string, emColuna?: boolean) => (
    <FiltrosAcoes
      id={id}
      campos={CAMPOS_FILTRO}
      opcoes={lista.opcoes}
      valores={l.selecao?.filtros ?? {}}
      onMudar={l.setFiltro}
      onLimpar={l.limpar}
      emColuna={emColuna}
    />
  );

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
        <section aria-labelledby="lista" className="flex flex-col gap-4">
          <h2 id="lista" className="text-xl font-semibold">
            As ações
          </h2>
          <div className="hidden rounded-lg border p-4 lg:block">
            {filtros("largo")}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p
              aria-live="polite"
              className="text-sm font-medium text-muted-foreground"
            >
              {lista.resumo}
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <Ordenar
                ordenacoes={ORDENACOES}
                ordem={l.selecao.ordem}
                onOrdem={l.setOrdem}
              />
              <FolhaFiltros ativos={lista.ativos} resumo={lista.resumo}>
                {filtros("folha", true)}
              </FolhaFiltros>
            </div>
          </div>
          <Cartoes cartoes={lista.cartoes} onLimpar={l.limpar} />
        </section>
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Alcance linhas={v.linhas} grafico={v.grafico} />
          <TotaisPortefolio texto={v.totaisTexto} />
        </div>
      </div>
    </div>
  );
}
