import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  construirInicio,
  corIIS,
  FAIXAS_MAPA,
  fraseAlcance,
  primeiraFrase,
} from "@/lib/vista-inicio";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

// Os dados reais de public/data. O alcance é o alcancePortefolio do Dan (lib/iis.ts).
const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const contexto = ler<Contexto[]>("public/data/contexto.json");
const meses = ler<Mes[]>("public/data/mensal.json");
const texto = (s: string) => s.replace(/\s/g, " ");
const vista = construirInicio(impacto, projetos, contexto, meses);

describe("fraseAlcance", () => {
  it("diz quantos em cada 10", () => {
    expect(fraseAlcance(53.32)).toBe(
      "5 em cada 10 estão onde a necessidade é alta.",
    );
    expect(fraseAlcance(3)).toBe(
      "Quase ninguém está onde a necessidade é alta.",
    );
    expect(fraseAlcance(97)).toBe(
      "Quase todos estão onde a necessidade é alta.",
    );
  });
});

describe("corIIS", () => {
  it("um só azul: escuro a partir de 60, médio a partir de 40, claro abaixo", () => {
    expect(corIIS(60)).toBe(FAIXAS_MAPA[0].cor);
    expect(corIIS(59.9)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(40)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(39.9)).toBe(FAIXAS_MAPA[2].cor);
  });
});

describe("primeiraFrase", () => {
  it("fica só com a primeira frase", () => {
    expect(primeiraFrase("Uma frase. Outra frase.")).toBe("Uma frase.");
    expect(primeiraFrase("Só uma, P07 e P10.")).toBe("Só uma, P07 e P10.");
  });
});

describe("construirInicio", () => {
  it("o alcance em grande, com a frase: 711 beneficiários por mês, 53% onde a necessidade é alta", () => {
    expect(vista?.alcance.beneficiarios).toBe("711");
    expect(texto(vista?.alcance.percentagem ?? "")).toBe("53%");
    expect(vista?.alcance.frase).toBe(
      "5 em cada 10 estão onde a necessidade é alta.",
    );
  });

  it("3 leituras: o maior IIS (P11), o primeiro ponto a confirmar (P03) e o fim de ano", () => {
    const [mais, confirmar, fim] = vista?.leituras ?? [];
    expect(mais.texto).toBe(
      "Projeto 11 (Uganda, logística) tem o maior IIS: 73 em 100.",
    );
    expect(mais.ligacao.href).toBe("/acoes/P11");
    expect(mais.noMapa).toBe("P11");
    expect(confirmar.ligacao.href).toBe("/acoes/P03");
    expect(confirmar.noMapa).toBe("P03");
    expect(confirmar.texto.startsWith("Projeto 03: ")).toBe(true);
    expect(fim.ligacao.href).toBe("/como-medimos");
    expect(fim.noMapa).toBeUndefined();
    expect(texto(fim.texto)).toBe(
      "Em novembro e dezembro, os beneficiários sobem 64% sem aumento da despesa. Por isso comparamos janeiro a outubro.",
    );
  });

  it("12 pontos no mapa, com as capitais e a cor do IIS", () => {
    expect(vista?.pontos).toHaveLength(12);
    const p11 = vista?.pontos.find((p) => p.id === "P11");
    expect(p11).toMatchObject({ latitude: 0.314269, longitude: 32.5729 });
    expect(p11?.cor).toBe(FAIXAS_MAPA[0].cor);
    expect(vista?.pontos.find((p) => p.id === "P04")?.cor).toBe(
      FAIXAS_MAPA[1].cor,
    );
  });

  it("até 3 a confirmar: mais pontos primeiro e, num empate, o menor IIS", () => {
    expect(vista?.aConfirmar.map((i) => i.projeto)).toEqual([
      "P03",
      "P01",
      "P02",
    ]);
    expect(vista?.aConfirmar[0].mais).toBe("E mais 1 ponto.");
    // só a primeira frase de cada ponto
    for (const i of vista?.aConfirmar ?? [])
      expect(i.texto.match(/\.\s/g)).toBeNull();
  });

  it("sem ações, não há vista (o ecrã mostra o estado vazio)", () => {
    expect(construirInicio([], projetos, contexto, meses)).toBeNull();
  });
});
