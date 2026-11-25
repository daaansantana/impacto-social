"use client";

import { useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VistaAuditoria } from "@/lib/vista-auditor";

type Props = {
  estado: "vazio" | "a-ler" | "pronto" | "erro";
  ficheiro?: string;
  erro?: string;
  vista?: VistaAuditoria;
  ficheiroDemo: string;
  onFicheiro: (ficheiro: File) => void;
  onExperimentar: () => void;
  onLimpar: () => void;
};

/** O protótipo do auditor: a zona para largar o CSV, os resultados e o email. */
export function Auditor({
  estado,
  ficheiro,
  erro,
  vista,
  ficheiroDemo,
  onFicheiro,
  onExperimentar,
  onLimpar,
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [porCima, setPorCima] = useState(false);

  return (
    <section
      aria-labelledby="auditor"
      className="flex flex-col gap-4 rounded-lg border p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="auditor" className="text-lg font-semibold">
          O auditor do ficheiro do mês
        </h2>
        <span className="rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium">
          Protótipo
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Verifica as datas, os dias 28 a 31, os domingos, os picos, as correções
        de despesa, os duplicados, as referências e as grafias, e prepara o
        email de correção ao parceiro.
      </p>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: a zona só recebe o arrastar; o botão e o input fazem o resto */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setPorCima(true);
        }}
        onDragLeave={() => setPorCima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setPorCima(false);
          const f = e.dataTransfer.files[0];
          if (f) onFicheiro(f);
        }}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 text-center ${porCima ? "border-primary bg-muted" : ""}`}
      >
        <p className="font-medium">Largue aqui o CSV do parceiro</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => input.current?.click()}>
            Escolher ficheiro
          </Button>
          <Button onClick={onExperimentar}>
            Experimentar com o ficheiro do P07
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="Escolher o CSV do parceiro"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFicheiro(f);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-muted-foreground">
          O exemplo é o {ficheiroDemo}, com os problemas originais. O ficheiro
          fica no seu computador: nada é enviado.
        </p>
      </div>

      <div aria-live="polite">
        {estado === "a-ler" ? (
          <p className="text-sm">A ler {ficheiro}…</p>
        ) : null}
        {estado === "erro" ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-2 rounded-lg border border-destructive/40 p-4 text-destructive"
          >
            <p className="font-medium">{ficheiro}</p>
            <p className="text-sm">{erro}</p>
            <Button variant="outline" size="sm" onClick={onLimpar}>
              Tentar outro ficheiro
            </Button>
          </div>
        ) : null}
        {estado === "pronto" && vista ? (
          <div className="flex flex-col gap-4">
            <p className="font-semibold">{vista.resumo}</p>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vista.cartoes.map((c) => (
                <li
                  key={c.titulo}
                  className={`flex flex-col gap-1 rounded-lg border p-4 ${c.tom === "aviso" ? "border-amber-600/40 bg-amber-50 dark:bg-amber-950/30" : ""}`}
                >
                  <p className="text-sm text-muted-foreground">
                    {c.tom === "aviso"
                      ? "A confirmar: "
                      : "Sem nada a assinalar: "}
                    {c.titulo}
                  </p>
                  <p className="font-semibold tabular-nums">{c.valor}</p>
                  {c.detalhe ? (
                    <p className="text-sm break-words">{c.detalhe}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            {vista.mailto ? (
              <a
                href={vista.mailto}
                className={buttonVariants({ className: "self-start" })}
              >
                Enviar ao parceiro
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                O ficheiro não diz de que projeto é, por isso não há parceiro a
                quem enviar.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
