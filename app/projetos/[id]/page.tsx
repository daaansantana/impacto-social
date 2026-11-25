"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InterruptorComparaveis } from "@/components/comum/interruptor-comparaveis";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { Avisos } from "@/components/projeto/avisos";
import { Destaque } from "@/components/projeto/destaque";
import { Porque } from "@/components/projeto/porque";
import { COR_FIM_DE_ANO, SerieMensal } from "@/components/projeto/serie-mensal";
import { TabelaMeses } from "@/components/projeto/tabela-meses";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useProjeto } from "@/hooks/use-projeto";
import { ROTULO_COMPARAVEIS } from "@/lib/portefolio";

function Voltar() {
  return (
    <Link
      href="/"
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      ‹ Portefólio
    </Link>
  );
}

export default function ProjetoPage() {
  const { id } = useParams<{ id: string }>();
  const p = useProjeto(id);

  if (p.estado === "error")
    return <EstadoErro mensagem={p.erro} onTentarDeNovo={p.tentarDeNovo} />;
  if (p.estado !== "ready") return <EstadoCarregar />;
  if (!p.vista)
    return (
      <div className="flex flex-col gap-6">
        <Voltar />
        <PageHeader title={`Projeto ${id}`} />
        <EstadoVazio
          mensagem={`Não há nenhum projeto ${id} nos dados. Volte ao Portefólio e escolha um dos 12.`}
        />
      </div>
    );

  const v = p.vista;
  return (
    <div className="flex flex-col gap-8">
      <Voltar />
      <PageHeader title={`${v.nome}, ${v.onde}`} intro={v.conclusao} emphasis>
        <InterruptorComparaveis
          rotulo={ROTULO_COMPARAVEIS}
          comparaveis={p.comparaveis}
          onComparaveis={p.setComparaveis}
        />
      </PageHeader>
      <div className={COLUMNS}>
        <div className="flex flex-col gap-6">
          <Destaque custo={v.custo} posicao={v.posicao} />
          <section aria-labelledby="mes-a-mes" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="mes-a-mes" className="text-xl font-semibold">
                Mês a mês
              </h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  aria-hidden
                  className="inline-block size-3 rounded-sm"
                  style={{ background: COR_FIM_DE_ANO }}
                />
                Novembro e dezembro
              </p>
            </div>
            {v.series.map((s) => (
              <SerieMensal key={s.chave} meses={v.meses} serie={s} />
            ))}
            <TabelaMeses meses={v.meses} series={v.series} />
          </section>
        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Avisos avisos={v.avisos} />
          <Porque indicadores={v.porque} />
          <p className="text-sm text-muted-foreground">{v.parceiro}</p>
        </div>
      </div>
    </div>
  );
}
