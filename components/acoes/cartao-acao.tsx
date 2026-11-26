import Link from "next/link";
import { SaudeBadge } from "@/components/acoes/saude-badge";
import { Onde } from "@/components/comum/area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CartaoAcao as Cartao } from "@/lib/vista-acoes";

/** Um cartão da lista: o nome, onde, o IIS numa barra, a saúde e a confiança. Leva à ação. */
export function CartaoAcao({ cartao }: { cartao: Cartao }) {
  return (
    <Card className="relative transition-colors hover:bg-muted/40">
      <CardHeader>
        <CardTitle>
          <Link
            href={cartao.ligacao}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {cartao.nome}
          </Link>
        </CardTitle>
        <CardDescription>
          <Onde local={cartao.local} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Índice de impacto social
            </span>
            <span className="text-2xl font-bold tabular-nums">
              {cartao.iisTexto}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                em 100
              </span>
            </span>
          </p>
          <div aria-hidden className="mt-1 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${cartao.iis}%` }}
            />
          </div>
        </div>
        <p className="text-sm tabular-nums">{cartao.metrica}</p>
        <div className="flex flex-wrap gap-2">
          <SaudeBadge nivel={cartao.saude} />
          <Badge variant="secondary">Confiança {cartao.confianca}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
