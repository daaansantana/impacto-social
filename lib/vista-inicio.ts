import { type Acao, juntarAcoes, precisaAtencao } from "@/lib/acoes";
import { fimDeAno } from "@/lib/fim-de-ano";
import { numero, percentagem } from "@/lib/format";
import { alcancePortefolio, iis, PREDEFINICOES, rankingIIS } from "@/lib/iis";
import { nomeArea, nomePais } from "@/lib/nomes";
import type { Contexto, ImpactoAcao, Mes, PontoMapa, Projeto } from "@/types";

// O ecrã Início (docs/PLANO-V2.md, secção 3): o alcance, 3 leituras, o mapa e «A confirmar com os parceiros».

const PESOS = PREDEFINICOES.equilibrado.pesos;

/** As 3 faixas do IIS no mapa: um só azul, do mais claro (IIS baixo) ao mais escuro (IIS alto). */
export const FAIXAS_MAPA = [
  { rotulo: "60 ou mais", cor: "#0e3d7e" },
  { rotulo: "40 a 59", cor: "#257de0" },
  { rotulo: "menos de 40", cor: "#84b9f3" },
] as const;

export function corIIS(valor: number): string {
  return FAIXAS_MAPA[valor >= 60 ? 0 : valor >= 40 ? 1 : 2].cor;
}

export type LeituraInicio = {
  id: "maisImpacto" | "aConfirmar" | "fimDeAno";
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
  texto: string;
  /** «e mais 1 ponto», quando há mais do que um */
  mais: string | null;
  href: string;
};

export type VistaInicio = {
  alcance: { beneficiarios: string; percentagem: string; frase: string };
  leituras: LeituraInicio[];
  pontos: PontoMapa[];
  aConfirmar: ItemAConfirmar[];
};

const onde = (a: Acao) => `${nomePais(a.pais)}, ${nomeArea(a.area)}`;
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
/** Só a primeira frase de um ponto de atenção: o detalhe fica no ecrã da ação. */
export const primeiraFrase = (texto: string) => {
  const fim = texto.search(/\.\s/);
  return fim < 0 ? texto : texto.slice(0, fim + 1);
};

/** A frase do alcance: quantos em cada 10 beneficiários estão onde a necessidade é alta. */
export function fraseAlcance(percentagemNecessidadeAlta: number): string {
  const emDez = Math.round(percentagemNecessidadeAlta / 10);
  if (emDez === 0) return "Quase ninguém está onde a necessidade é alta.";
  if (emDez === 10) return "Quase todos estão onde a necessidade é alta.";
  return `${emDez} em cada 10 estão onde a necessidade é alta.`;
}

/** A vista do Início; null quando não há ações. */
export function construirInicio(
  impacto: ImpactoAcao[],
  projetos: Projeto[],
  contexto: Contexto[],
  meses: Mes[],
): VistaInicio | null {
  if (impacto.length === 0) return null;
  const porPais = new Map(contexto.map((c) => [c.pais, c]));
  const acoes: Acao[] = juntarAcoes(impacto, projetos, contexto);

  const a = alcancePortefolio(impacto);
  const fim = fimDeAno(meses);
  const confirmar = precisaAtencao(acoes, PESOS);
  const leituras: LeituraInicio[] = [];

  const [primeira] = rankingIIS(acoes, PESOS);
  const melhor = acoes.find((x) => x.projeto === primeira?.projeto);
  if (melhor && primeira)
    leituras.push({
      id: "maisImpacto",
      titulo: "Mais impacto",
      texto: `${melhor.nome} (${onde(melhor)}) tem o maior IIS: ${numero(primeira.iis)} em 100.`,
      ligacao: { href: `/acoes/${melhor.projeto}`, rotulo: "Abrir a ação" },
      noMapa: melhor.projeto,
    });

  const [ponto] = confirmar;
  if (ponto)
    leituras.push({
      id: "aConfirmar",
      titulo: "A confirmar",
      texto: `${ponto.nome}: ${minuscula(primeiraFrase(ponto.pontos[0].texto))}`,
      ligacao: { href: `/acoes/${ponto.projeto}`, rotulo: "Abrir a ação" },
      noMapa: ponto.projeto,
    });

  leituras.push({
    id: "fimDeAno",
    titulo: "Fim do ano",
    texto: `Em novembro e dezembro, os beneficiários sobem ${percentagem(fim.beneficiariosPorMes.subida * 100)} ${fim.despesaPorMes.subida <= 0 ? "sem aumento da despesa" : `e a despesa só ${percentagem(fim.despesaPorMes.subida * 100)}`}. Por isso comparamos janeiro a outubro.`,
    ligacao: { href: "/como-medimos", rotulo: "Ver como medimos" },
  });

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
      frase: fraseAlcance(a.percentagemNecessidadeAlta),
    },
    leituras,
    pontos,
    aConfirmar: confirmar.map((x) => {
      const resto = x.pontos.length - 1;
      return {
        projeto: x.projeto,
        nome: x.nome,
        onde: onde(x),
        texto: maiuscula(primeiraFrase(x.pontos[0].texto)),
        mais:
          resto > 0
            ? `E mais ${resto === 1 ? "1 ponto" : `${resto} pontos`}.`
            : null,
        href: `/acoes/${x.projeto}`,
      };
    }),
  };
}
