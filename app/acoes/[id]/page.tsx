"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Dimensoes } from "@/components/acoes/dimensoes";
import { Recursos } from "@/components/acoes/recursos";
import { SaudeAcao } from "@/components/acoes/saude-acao";
import {
  EstadoCarregar,
  EstadoErro,
  EstadoVazio,
} from "@/components/estados/estados";
import { COR_FIM_DE_ANO, SerieMensal } from "@/components/projeto/serie-mensal";
import { TabelaMeses } from "@/components/projeto/tabela-meses";
import { COLUMNS, PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useAcao } from "@/hooks/use-acao";

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

function Dobrado({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-lg border">
      <summary className="cursor-pointer p-4 font-semibold">{titulo}</summary>
      <div className="flex flex-col gap-3 border-t p-4">{children}</div>
    </details>
  );
}

export default function AcaoPage() {
  const { id } = useParams<{ id: string }>();
  const a = useAcao(id);

  if (a.estado === "error")
    return <EstadoErro mensagem={a.erro} onTentarDeNovo={a.tentarDeNovo} />;
  if (a.estado !== "ready") return <EstadoCarregar />;
  if (!a.vista)
    return (
      <div className="flex flex-col gap-6">
        <Voltar />
        <PageHeader title={`Ação ${id}`} />
        <EstadoVazio
          mensagem={`Não há nenhuma ação ${id} nos dados. Volte às Ações e escolha uma das 12.`}
        />
      </div>
    );

  const v = a.vista;
  return (
    <div className="flex flex-col gap-8">
      <Voltar />
      <PageHeader title={v.nome} intro={v.intro} />
      <div className={COLUMNS}>
        <div className="flex flex-col gap-6">
          <section aria-labelledby="resumo" className="rounded-lg border p-5">
            <h2 id="resumo" className="mb-3 text-lg font-semibold">
              Resumo
            </h2>
            <dl className="flex flex-col gap-3">
              {v.resumo.map((r) => (
                <div
                  key={r.rotulo}
                  className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]"
                >
                  <dt className="text-muted-foreground">{r.rotulo}</dt>
                  <dd>{r.texto}</dd>
                </div>
              ))}
            </dl>
          </section>
          <Dimensoes
            iisTexto={v.iisTexto}
            faixa={v.faixa}
            dimensoes={v.dimensoes}
            fonte={v.fonteNecessidade}
          />
          <Recursos linhas={v.recursos} relacao={v.relacao} />
        </div>
        <div className="lg:sticky lg:top-6">
          <SaudeAcao lentes={v.saude} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Dobrado titulo="A evolução, mês a mês">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="inline-block size-3 rounded-sm"
              style={{ background: COR_FIM_DE_ANO }}
            />
            Novembro e dezembro, fora dos meses comparáveis
          </p>
          {v.evolucao.series.map((s) => (
            <SerieMensal key={s.chave} meses={v.evolucao.meses} serie={s} />
          ))}
          <TabelaMeses meses={v.evolucao.meses} series={v.evolucao.series} />
        </Dobrado>
        <Dobrado titulo="Pontos de atenção">
          {v.pontos.length ? (
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {v.pontos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p>
              Esta ação não tem pontos próprios a confirmar. Os pontos comuns a
              todas (o fim de ano e o dia 27) estão em Como medimos.
            </p>
          )}
        </Dobrado>
        <Dobrado titulo="O que pedir ao parceiro">
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {v.pedidos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <a
            href={v.mailto}
            className={buttonVariants({
              size: "lg",
              className: "self-start",
            })}
          >
            Escrever ao parceiro
          </a>
        </Dobrado>
        <Dobrado titulo="O que aprendemos">
          {v.aprendemos.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </Dobrado>
      </div>
    </div>
  );
}
