import Link from "next/link";
import type { ReactNode } from "react";
import { EtiquetaSaude } from "@/components/lista-acoes/lista-acoes";
import type {
  DimensaoDetalhe,
  LinhaResumo,
  PontoAtencao,
  VistaDetalhe,
} from "@/lib/detalhe-acao";

/** Uma secção dobrada: o título à vista, o conteúdo a pedido. */
export function Dobrado({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <details id={id} className="group rounded-lg border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-lg font-semibold marker:hidden">
        <span className="underline-offset-4 group-hover:underline">
          {titulo}
        </span>
        <span
          aria-hidden
          className="text-muted-foreground transition-transform group-open:rotate-90"
        >
          ›
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t p-4">{children}</div>
    </details>
  );
}

/** O resumo: o quê, o objetivo, onde, o formato e o público. */
export function Resumo({ linhas }: { linhas: LinhaResumo[] }) {
  return (
    <section aria-labelledby="resumo" className="flex flex-col gap-3">
      <h2 id="resumo" className="text-xl font-semibold">
        Resumo
      </h2>
      <dl className="grid gap-x-6 gap-y-3 rounded-lg border p-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        {linhas.map((l) => (
          <div key={l.rotulo} className="contents">
            <dt className="font-medium text-muted-foreground">{l.rotulo}</dt>
            <dd className={l.semDado ? "italic text-muted-foreground" : ""}>
              {l.texto}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Barra({ d }: { d: DimensaoDetalhe }) {
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{d.titulo}</span>
        <span className="font-semibold tabular-nums">{d.valorTexto}</span>
      </div>
      <div aria-hidden className="h-2 rounded-full bg-muted">
        {d.valor !== null ? (
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, d.valor))}%` }}
          />
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">{d.frase}</p>
    </li>
  );
}

/** O IIS e as 4 dimensões em barras, com uma frase cada e a fonte da necessidade. */
export function Iis({
  iis,
  dimensoes,
  fonte,
}: {
  iis: VistaDetalhe["iis"];
  dimensoes: DimensaoDetalhe[];
  fonte: string;
}) {
  return (
    <section aria-labelledby="iis" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 id="iis" className="text-xl font-semibold">
          Índice de Impacto Social
        </h2>
        <p className="text-4xl font-bold tabular-nums">
          {iis.texto}
          <span className="text-base font-normal text-muted-foreground">
            {" "}
            em 100
          </span>
        </p>
      </div>
      <ul className="flex flex-col gap-4 rounded-lg border p-4">
        {dimensoes.map((d) => (
          <Barra key={d.titulo} d={d} />
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">{fonte}</p>
    </section>
  );
}

/** Recursos e resultados: só os totais e os rácios de janeiro a outubro. */
export function Recursos({
  linhas,
  relacao,
}: {
  linhas: VistaDetalhe["recursos"];
  relacao: string;
}) {
  return (
    <section aria-labelledby="recursos" className="flex flex-col gap-3">
      <h2 id="recursos" className="text-xl font-semibold">
        Recursos e resultados
      </h2>
      <p className="text-sm text-muted-foreground">De janeiro a outubro.</p>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex flex-col rounded-lg border p-3">
            <dt className="order-2 text-sm text-muted-foreground">
              {l.rotulo}
            </dt>
            <dd className="text-2xl font-bold tabular-nums">{l.valor}</dd>
          </div>
        ))}
      </dl>
      <p>{relacao}</p>
    </section>
  );
}

/** A saúde da ação: as 5 lentes, cada uma com um nível e uma frase. */
export function SaudeAcao({ lentes }: { lentes: VistaDetalhe["saude"] }) {
  return (
    <section aria-labelledby="saude" className="flex flex-col gap-3">
      <h2 id="saude" className="text-xl font-semibold">
        Saúde da ação
      </h2>
      <ul className="divide-y rounded-lg border">
        {lentes.map((l) => (
          <li key={l.lente} className="flex flex-col gap-1.5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{l.lente}</span>
              <EtiquetaSaude nivel={l.nivel} texto={l.nivelTexto} />
            </div>
            <p className="text-sm text-muted-foreground">{l.frase}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Os pontos de atenção próprios desta ação; as notas gerais ficam em «Como medimos». */
export function Pontos({ pontos }: { pontos: PontoAtencao[] }) {
  return (
    <>
      {pontos.length ? (
        <ul className="flex flex-col gap-3">
          {pontos.map((p) => (
            <li key={p.id} className="flex flex-col gap-1">
              <p className="font-medium">{p.titulo}</p>
              <p className="text-pretty">{p.texto}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Os dados desta ação não levantam pontos próprios.</p>
      )}
      <p className="text-sm text-muted-foreground">
        O pico de fim de ano e a falta de registos depois do dia 27 valem para
        todas as ações: estão em{" "}
        <Link
          href="/como-medimos"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Como medimos
        </Link>
        .
      </p>
    </>
  );
}

/** O que pedir ao parceiro, com o rascunho de email. */
export function Pedidos({
  pedidos,
  mailto,
}: {
  pedidos: string[];
  mailto: string;
}) {
  return (
    <>
      <ul className="flex list-disc flex-col gap-1.5 pl-5">
        {pedidos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <a
        href={mailto}
        className="inline-flex h-10 w-fit items-center rounded-md border bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Abrir rascunho de email
      </a>
      <p className="text-sm text-muted-foreground">
        O email abre no seu programa de correio, com estes pedidos e os pontos
        de atenção. Falta só o destinatário.
      </p>
    </>
  );
}

export function Aprendemos({ frases }: { frases: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {frases.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  );
}
