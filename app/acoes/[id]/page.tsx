"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Aprendemos,
  Dobrado,
  Iis,
  Pedidos,
  Pontos,
  Recursos,
  Resumo,
  SaudeAcao,
} from "@/components/detalhe-acao/detalhe-acao";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { MapaAcoes } from "@/components/mapa/mapa-acoes";
import { COR_FIM_DE_ANO, SerieMensal } from "@/components/projeto/serie-mensal";
import { TabelaMeses } from "@/components/projeto/tabela-meses";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { useDetalheAcao } from "@/hooks/use-detalhe-acao";

function Voltar() {
  return (
    <Link
      href="/acoes"
      className="text-sm font-medium underline-offset-4 hover:underline"
    >
      ‹ Ações
    </Link>
  );
}

export default function AcaoPage() {
  const { id } = useParams<{ id: string }>();
  const p = useDetalheAcao(id);

  if (p.estado === "error")
    return <EstadoErro mensagem={p.erro} onTentarDeNovo={p.tentarDeNovo} />;
  if (p.estado !== "ready") return <EstadoCarregar />;
  if (!p.vista)
    return (
      <div className="flex flex-col gap-6">
        <Voltar />
        <PageHeader title={`Ação ${id}`} />
        <EstadoVazio
          mensagem={`Não há nenhuma ação ${id} nos dados. Volte a Ações e escolha uma das 12.`}
        />
      </div>
    );

  const v = p.vista;
  return (
    <div className="flex flex-col gap-8">
      <Voltar />
      <PageHeader title={v.nome} intro={v.intro} />
      <div className={COLUMNS}>
        <div className="flex flex-col gap-8">
          <Resumo linhas={v.resumo} />
          <Iis iis={v.iis} dimensoes={v.dimensoes} fonte={v.fonteNecessidade} />
          <Recursos linhas={v.recursos} relacao={v.relacao} />
        </div>
        <div className="flex flex-col gap-8">
          {v.ponto ? (
            <section aria-labelledby="onde" className="flex flex-col gap-3">
              <h2 id="onde" className="text-xl font-semibold">
                Onde
              </h2>
              <MapaAcoes
                pontos={[v.ponto]}
                centro={[v.ponto.longitude, v.ponto.latitude]}
                zoom={3}
                className="h-56"
              />
            </section>
          ) : null}
          <SaudeAcao lentes={v.saude} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Dobrado id="evolucao" titulo="Evolução">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="inline-block size-3 rounded-sm bg-primary"
            />
            Meses comparáveis (janeiro a outubro)
            <span
              aria-hidden
              className="ml-3 inline-block size-3 rounded-sm"
              style={{ background: COR_FIM_DE_ANO }}
            />
            Novembro e dezembro: fim de ano, fora dos totais e dos rácios
          </p>
          {v.evolucao.series.map((s) => (
            <SerieMensal key={s.chave} meses={v.evolucao.meses} serie={s} />
          ))}
          <TabelaMeses meses={v.evolucao.meses} series={v.evolucao.series} />
        </Dobrado>
        <Dobrado id="pontos" titulo="Pontos de atenção">
          <Pontos pontos={v.pontos} />
        </Dobrado>
        <Dobrado id="pedidos" titulo="O que pedir ao parceiro">
          <Pedidos pedidos={v.pedidos} mailto={v.mailto} />
        </Dobrado>
        <Dobrado id="aprendemos" titulo="O que aprendemos">
          <Aprendemos frases={v.aprendemos} />
        </Dobrado>
      </div>
    </div>
  );
}
