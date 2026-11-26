"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { EntradaNovoProjeto } from "@/lib/exemplo-radar";
import type {
  LinhaDiferenca,
  Opcao,
  VistaNovoProjeto,
  VistaRadar,
} from "@/lib/vista-radar";
import type { Quadrante } from "@/types";

/** O seletor de área: muda o mapa, o quadrante e a lista ao mesmo tempo. */
export function SeletorArea({
  areas,
  area,
  onArea,
}: {
  areas: Opcao[];
  area: string;
  onArea: (area: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="area">Área</Label>
      <NativeSelect
        id="area"
        className="w-full sm:w-64 [&_select]:h-10 [&_select]:text-base"
        value={area}
        onChange={(e) => onArea(e.target.value)}
      >
        {areas.map((a) => (
          <option key={a.valor} value={a.valor}>
            {a.rotulo}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

/** As duas legendas do mapa: a cor é a necessidade, o tamanho é a evidência. */
export function LegendaRadar({
  faixas,
  semDado,
  tamanhos,
}: {
  faixas: readonly { rotulo: string; cor: string }[];
  semDado: string;
  tamanhos: { rotulo: string; tamanho: number }[];
}) {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-foreground">
          Cor: necessidade (percentil)
        </span>
        {faixas.map((f) => (
          <span key={f.rotulo} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: f.cor }}
            />
            {f.rotulo}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-3 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: semDado }}
          />
          Sem dado
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-foreground">Tamanho: evidência</span>
        {tamanhos.map((t) => (
          <span key={t.rotulo} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="rounded-full border border-muted-foreground/60"
              style={{ width: t.tamanho, height: t.tamanho }}
            />
            {t.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

/** O quadrante necessidade × evidência, com as quatro zonas e os pontos estimados a tracejado. */
export function QuadranteRadar({
  quadrante,
  zonas,
}: {
  quadrante: VistaRadar["quadrante"];
  zonas: { quadrante: Quadrante; explicacao: string }[];
}) {
  const limite = Math.min(95, Math.max(5, quadrante.limite));
  const caixa: Record<Quadrante, React.CSSProperties> = {
    "Repensar ou apoiar": {
      left: 0,
      top: 0,
      width: `${limite}%`,
      height: "50%",
    },
    Reforçar: { left: `${limite}%`, top: 0, right: 0, height: "50%" },
    Reavaliar: { left: 0, top: "50%", width: `${limite}%`, bottom: 0 },
    Manter: { left: `${limite}%`, top: "50%", right: 0, bottom: 0 },
  };
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex w-5 shrink-0 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-medium text-muted-foreground">
            Necessidade ↑
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div
            role="img"
            aria-label={`Quadrante necessidade por evidência: ${quadrante.pontos.map((p) => p.descricao).join("; ")}`}
            className="relative aspect-square w-full max-w-[560px] overflow-hidden rounded-lg border sm:aspect-[4/3]"
          >
            {zonas.map((z) => (
              <div
                key={z.quadrante}
                data-zona={z.quadrante}
                className={`absolute flex flex-col gap-0.5 border-dashed p-2 ${CANTO[z.quadrante]} ${z.quadrante === "Reforçar" ? "bg-muted/70" : "bg-muted/25"} ${z.quadrante === "Repensar ou apoiar" || z.quadrante === "Reavaliar" ? "border-r" : ""} ${z.quadrante === "Repensar ou apoiar" || z.quadrante === "Reforçar" ? "border-b" : ""}`}
                style={caixa[z.quadrante]}
              >
                <span className="text-xs font-semibold sm:text-sm">
                  {z.quadrante}
                </span>
                <span className="hidden max-w-[22ch] text-xs leading-snug text-muted-foreground sm:block">
                  {z.explicacao}
                </span>
              </div>
            ))}
            {quadrante.pontos.map((p) => (
              <div
                key={p.pais}
                data-pais={p.pais}
                data-estimado={p.estimado}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center"
                style={{
                  left: `${Math.min(97, Math.max(3, p.x))}%`,
                  top: `${Math.min(97, Math.max(3, 100 - p.y))}%`,
                }}
                title={p.descricao}
              >
                <span
                  aria-hidden
                  className={`block size-3 rounded-full ${p.estimado ? "border-2 border-dashed border-foreground bg-background" : "bg-foreground"}`}
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] leading-none ${p.esquerda ? "right-4 text-right" : "left-4"}`}
                >
                  <span className="font-semibold">{p.codigo}</span>
                  {p.estimado ? (
                    <span className="text-muted-foreground"> estimado</span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
          <div className="flex max-w-[560px] justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="font-medium">Evidência →</span>
            <span>100</span>
          </div>
        </div>
      </div>
      <figcaption className="flex flex-col gap-1 text-sm text-muted-foreground">
        <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-3 rounded-full bg-foreground" />
            Com ação no país
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3 rounded-full border-2 border-dashed border-foreground"
            />
            Estimado: sem ação no país, a partir da mesma área noutros países
          </span>
        </span>
        <span>
          Necessidade alta: acima do percentil 50. Evidência alta: acima de{" "}
          {quadrante.limiteTexto}, a mediana das ações.
        </span>
        {quadrante.semDado.length ? (
          <span>
            Fora do gráfico, sem dado da necessidade:{" "}
            {quadrante.semDado.join(", ")}.
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** O nome e a explicação de cada zona ficam no canto de fora, longe das linhas onde os pontos se juntam. */
const CANTO: Record<Quadrante, string> = {
  "Repensar ou apoiar": "items-start justify-start text-left",
  Reforçar: "items-end justify-start text-right",
  Reavaliar: "items-start justify-end text-left",
  Manter: "items-end justify-end text-right",
};

const COR_LEITURA: Record<Quadrante, string> = {
  Reforçar: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  "Repensar ou apoiar": "bg-amber-50 text-amber-900 ring-amber-200",
  Manter: "bg-sky-50 text-sky-900 ring-sky-200",
  Reavaliar: "bg-red-50 text-red-900 ring-red-200",
};

/** «Onde faria mais diferença»: a lista da área, do mais urgente ao menos. */
export function ListaDiferenca({
  linhas,
  notaEstimado,
}: {
  linhas: LinhaDiferenca[];
  notaEstimado: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th scope="col" className="px-1.5 py-2 sm:p-3 font-medium">
                País
              </th>
              <th scope="col" className="px-1.5 py-2 sm:p-3 font-medium">
                Necessidade{" "}
                <span className="hidden font-normal sm:inline">
                  (percentil)
                </span>
              </th>
              <th scope="col" className="px-1.5 py-2 sm:p-3 font-medium">
                Evidência
              </th>
              <th scope="col" className="px-1.5 py-2 sm:p-3 font-medium">
                Leitura
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.pais} className="border-b last:border-0 align-top">
                <th
                  scope="row"
                  className="px-1.5 py-2 sm:p-3 text-left font-medium"
                >
                  {l.pais}
                </th>
                <td className="px-1.5 py-2 sm:p-3 tabular-nums">
                  {l.necessidade}
                </td>
                <td className="px-1.5 py-2 sm:p-3 tabular-nums">
                  {l.evidencia}
                  {l.estimado ? (
                    <span className="ml-1.5 inline-block rounded border border-dashed px-1 text-xs text-muted-foreground">
                      estimado
                    </span>
                  ) : null}
                </td>
                <td className="px-1.5 py-2 sm:p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:text-sm ring-1 ring-inset ${l.quadrante ? COR_LEITURA[l.quadrante] : "bg-muted text-muted-foreground ring-border"}`}
                  >
                    {l.leitura}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notaEstimado ? (
        <p className="text-sm text-muted-foreground">{notaEstimado}</p>
      ) : null}
    </div>
  );
}

export function EtiquetaPrototipo() {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
      Protótipo
    </span>
  );
}

/** «Novo projeto» (protótipo): país, área, formato e orçamento → alcance, necessidade, confiança e leitura. */
export function NovoProjetoPainel({
  paises,
  areas,
  areaInicial,
  onCalcular,
  resultado,
  calculado,
}: {
  paises: Opcao[];
  areas: Opcao[];
  areaInicial: string;
  onCalcular: (entrada: EntradaNovoProjeto) => void;
  resultado: VistaNovoProjeto | null;
  calculado: boolean;
}) {
  return (
    <section
      aria-labelledby="novo-projeto"
      className="flex flex-col gap-4 rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="novo-projeto" className="text-lg font-semibold">
          Novo projeto
        </h2>
        <EtiquetaPrototipo />
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onCalcular({
            pais: String(f.get("pais")),
            area: String(f.get("area")),
            formato: String(f.get("formato")).trim() || "oficinas",
            orcamento: Number(f.get("orcamento")),
          });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-pais">País</Label>
          <NativeSelect
            id="np-pais"
            name="pais"
            className="w-full [&_select]:h-10 [&_select]:text-base"
            defaultValue={paises[0]?.valor}
          >
            {paises.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-area">Área</Label>
          <NativeSelect
            id="np-area"
            name="area"
            className="w-full [&_select]:h-10 [&_select]:text-base"
            defaultValue={areaInicial}
          >
            {areas.map((a) => (
              <option key={a.valor} value={a.valor}>
                {a.rotulo}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-formato">Formato</Label>
          <input
            id="np-formato"
            name="formato"
            defaultValue="oficinas"
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="np-orcamento">Orçamento (€)</Label>
          <input
            id="np-orcamento"
            name="orcamento"
            type="number"
            min={1000}
            step={1000}
            required
            defaultValue={250000}
            className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button type="submit" className="h-10">
          Calcular
        </Button>
      </form>
      <div aria-live="polite">
        {resultado ? (
          <dl className="grid grid-cols-1 gap-2 border-t pt-4">
            <div>
              <dt className="text-sm text-muted-foreground">
                Alcance estimado
              </dt>
              <dd className="text-xl font-bold tabular-nums">
                {resultado.alcance}
              </dd>
              <dd className="text-sm text-muted-foreground">
                {resultado.custo}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Necessidade</dt>
              <dd className="font-medium">{resultado.necessidade}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Confiança</dt>
              <dd className="font-medium">{resultado.confianca}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Leitura</dt>
              <dd
                className="text-lg font-semibold"
                data-leitura={resultado.leituraChave}
              >
                {resultado.leitura}
              </dd>
              <dd className="text-sm text-muted-foreground">
                {resultado.motivo}
              </dd>
            </div>
          </dl>
        ) : calculado ? (
          <p className="border-t pt-4 text-muted-foreground">
            Não há dados para este país e esta área. Escolha outra combinação.
          </p>
        ) : null}
      </div>
    </section>
  );
}
