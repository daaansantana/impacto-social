import {
  BD,
  BR,
  CO,
  GH,
  IN,
  KE,
  MZ,
  PE,
  PH,
  PT,
  SN,
  UG,
} from "country-flag-icons/react/3x2";
import { codigoPais } from "@/lib/nomes";
import { cn } from "@/lib/utils";

// Só as bandeiras dos 12 países, para o resto do pacote não entrar no site.
const BANDEIRAS = { BD, BR, CO, GH, IN, KE, MZ, PE, PH, PT, SN, UG };

/** A bandeira do país, em SVG (as bandeiras em emoji não aparecem no Windows). Decorativa: o nome vai sempre ao lado. */
export function Bandeira({
  pais,
  className,
}: {
  /** a chave dos dados: «Mocambique» */
  pais: string;
  className?: string;
}) {
  const codigo = codigoPais(pais) as keyof typeof BANDEIRAS | null;
  const Svg = codigo ? BANDEIRAS[codigo] : null;
  return Svg ? (
    <Svg
      aria-hidden
      className={cn(
        "h-[0.8em] w-auto shrink-0 rounded-[2px] ring-1 ring-foreground/15",
        className,
      )}
    />
  ) : null;
}

/** O nome do país com a bandeira à esquerda. */
export function Pais({
  pais,
  nome,
  className,
}: {
  pais: string;
  nome: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Bandeira pais={pais} />
      {nome}
    </span>
  );
}
