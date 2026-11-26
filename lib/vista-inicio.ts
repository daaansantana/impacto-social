import {
  type Acao,
  juntarAcoes,
  type Leitura,
  leituras as lerLeituras,
  precisaAtencao,
} from "@/lib/acoes";
import { numero, percentagem } from "@/lib/format";
import { alcancePortefolio, iis, PREDEFINICOES } from "@/lib/iis";
import { type Local, local, nomeArea, nomePais } from "@/lib/nomes";
import type { Dados, PontoMapa } from "@/types";

// O ecrã Início (docs/PLANO-V2.md, secção 3): o alcance, 3 leituras, o mapa e «A confirmar com os parceiros».

const PESOS = PREDEFINICOES.equilibrado.pesos;

/** As 3 faixas do IIS no mapa, com as cores da Lupa: verde, ardósia e cinza, sempre com contorno branco. */
export const FAIXAS_MAPA = [
  { rotulo: "60 ou mais", cor: "#3d6b1e" },
  { rotulo: "40 a 59", cor: "#36415a" },
  { rotulo: "menos de 40", cor: "#5b6478" },
] as const;

export function corIIS(valor: number): string {
  return FAIXAS_MAPA[valor >= 60 ? 0 : valor >= 40 ? 1 : 2].cor;
}

export type LeituraInicio = {
  id: Leitura["id"];
  titulo: string;
  texto: string;
  ligacao: { href: string; rotulo: string };
  /** a ação a localizar no mapa, quando a leitura é sobre uma ação */
  noMapa?: string;
};

export type ItemAConfirmar = {
  projeto: string;
  nome: string;
  onde: string;
  local: Local;
  texto: string;
  /** «e mais 1 ponto», quando há mais do que um */
  mais: string | null;
  href: string;
};

export type VistaInicio = {
  alcance: { beneficiarios: string; percentagem: string; frase: string };
  leituras: LeituraInicio[];
  pontos: PontoMapa[];
  /** só as faixas que têm pontos no mapa, para a legenda */
  faixas: (typeof FAIXAS_MAPA)[number][];
  aConfirmar: ItemAConfirmar[];
};

const onde = (a: Acao) => `${nomePais(a.pais)}, ${nomeArea(a.area)}`;
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** O que quer dizer «necessidade alta» (o alcancePortefolio: acima do meio, entre os países com dado). */
export const NECESSIDADE_ALTA =
  "Necessidade alta: o país está na metade com mais necessidade, no indicador da área, entre os países com dado (Banco Mundial).";

const TITULOS: Record<Leitura["id"], string> = {
  maisImpacto: "Mais impacto",
  atencao: "A confirmar",
  fimDeAno: "Fim do ano",
};

/** As leituras de lib/acoes no desenho dos cartões do Início: um título, o link e, numa ação, o ponto no mapa. */
function cartao(l: Leitura): LeituraInicio {
  const acao = /^\/acoes\/(\w+)$/.exec(l.ligacao)?.[1];
  return {
    id: l.id,
    titulo: TITULOS[l.id],
    texto: l.texto,
    ligacao: {
      href: l.ligacao,
      rotulo: acao
        ? "Abrir a ação"
        : l.ligacao === "/como-medimos"
          ? "Ver como medimos"
          : "Ver as ações",
    },
    noMapa: acao,
  };
}

/** A vista do Início, com os dados reais; null quando não há ações. */
export function construirInicio(
  dados: Pick<Dados, "impacto" | "projetos" | "contexto" | "mensal">,
): VistaInicio | null {
  if (dados.impacto.length === 0) return null;
  const acoes: Acao[] = juntarAcoes(
    dados.impacto,
    dados.projetos,
    dados.contexto,
  );
  const porPais = new Map(dados.contexto.map((c) => [c.pais, c]));
  const a = alcancePortefolio(dados.impacto);
  const confirmar = precisaAtencao(acoes, PESOS);

  const pontos = acoes.flatMap((x): PontoMapa[] => {
    const c = porPais.get(x.pais);
    if (!c) return [];
    const valor = iis(x, PESOS);
    return [
      {
        id: x.projeto,
        nome: x.nome,
        latitude: c.lat,
        longitude: c.lng,
        iis: valor,
        cor: corIIS(valor),
      },
    ];
  });

  return {
    alcance: {
      beneficiarios: numero(a.beneficiariosPorMes),
      percentagem: percentagem(a.percentagemNecessidadeAlta),
      frase: NECESSIDADE_ALTA,
    },
    leituras: lerLeituras(acoes, dados.mensal, PESOS).map(cartao),
    pontos,
    faixas: FAIXAS_MAPA.filter((f) => pontos.some((p) => p.cor === f.cor)),
    aConfirmar: confirmar.map((x) => {
      const resto = x.pontos.length - 1;
      return {
        projeto: x.projeto,
        nome: x.nome,
        onde: onde(x),
        local: local(x.pais, x.area),
        texto: maiuscula(x.pontos[0].texto),
        mais:
          resto > 0
            ? `E mais ${resto === 1 ? "1 ponto" : `${resto} pontos`}.`
            : null,
        href: `/acoes/${x.projeto}`,
      };
    }),
  };
}
