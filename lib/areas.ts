import type { IconProps } from "@solar-icons/react";
import {
  BookIcon,
  HeartPulseIcon,
  LaptopIcon,
  MegaphoneIcon,
  SquareAcademicCapIcon,
  TruckIcon,
} from "@solar-icons/react/linear";
import type { ComponentType } from "react";

/** O ícone de cada área (Solar, linear). É o único sítio onde se escolhem. */
export const ICONES_AREA: Record<string, ComponentType<IconProps>> = {
  educacao: BookIcon,
  formacao: SquareAcademicCapIcon,
  saude: HeartPulseIcon,
  tecnologia: LaptopIcon,
  logistica: TruckIcon,
  comunicacao: MegaphoneIcon,
};

/** O ícone da área, pela chave dos dados («saude»); `null` se a área não tiver ícone. */
export const iconeArea = (area: string) => ICONES_AREA[area] ?? null;
