import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  construirInicio,
  corIIS,
  FAIXAS_MAPA,
  NECESSIDADE_ALTA,
} from "@/lib/vista-inicio";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

// O Início com os dados reais de public/data.
const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const dados = {
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
  mensal: ler<Mes[]>("public/data/mensal.json"),
};
const texto = (s: string) => s.replace(/\s/g, " ");
const vista = construirInicio(dados);

describe("corIIS", () => {
  it("um só azul: escuro a partir de 60, médio a partir de 40, claro abaixo", () => {
    expect(corIIS(60)).toBe(FAIXAS_MAPA[0].cor);
    expect(corIIS(59.9)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(40)).toBe(FAIXAS_MAPA[1].cor);
    expect(corIIS(39.9)).toBe(FAIXAS_MAPA[2].cor);
  });
});

describe("construirInicio", () => {
  it("o alcance em grande: 711 beneficiários por mês, 53% onde a necessidade é alta", () => {
    expect(vista?.alcance.beneficiarios).toBe("711");
    expect(texto(vista?.alcance.percentagem ?? "")).toBe("53%");
    expect(vista?.alcance.frase).toBe(NECESSIDADE_ALTA);
    expect(NECESSIDADE_ALTA).toBe(
      "Necessidade alta: o país está na metade com mais necessidade, no indicador da área, entre os países com dado (Banco Mundial).",
    );
  });

  it("3 leituras de lib/acoes: o maior IIS (P11), o que confirmar (P03) e o fim de ano", () => {
    const [mais, confirmar, fim] = vista?.leituras ?? [];
    expect(mais.texto).toBe(
      "O Projeto 11 (Uganda, logística) tem o maior impacto: 73 em 100. Destaca-se na duração: é a 1.ª das 12 ações.",
    );
    expect(mais.ligacao).toEqual({
      href: "/acoes/P11",
      rotulo: "Abrir a ação",
    });
    expect(mais.noMapa).toBe("P11");
    expect(confirmar.texto).toBe(
      "O Projeto 03 tem 2 pontos a confirmar com o parceiro.",
    );
    expect(confirmar.noMapa).toBe("P03");
    expect(fim.ligacao).toEqual({
      href: "/como-medimos",
      rotulo: "Ver como medimos",
    });
    expect(fim.noMapa).toBeUndefined();
  });

  it("as 12 ações no mapa, com as capitais e a cor do IIS", () => {
    expect(vista?.pontos).toHaveLength(12);
    const p11 = vista?.pontos.find((p) => p.id === "P11");
    expect(p11?.iis).toBe(72.5);
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
  });

  it("sem ações, não há vista (o ecrã mostra o estado vazio)", () => {
    expect(construirInicio({ ...dados, impacto: [] })).toBeNull();
  });
});
