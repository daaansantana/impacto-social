import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  construirDetalhe,
  PEDIDOS_PARCEIRO,
  recursosJanOut,
} from "@/lib/detalhe-acao";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const impacto = ler<ImpactoAcao[]>("public/data/impacto.json");
const projetos = ler<Projeto[]>("public/data/projetos.json");
const contexto = ler<Contexto[]>("public/data/contexto.json");
const meses = ler<Mes[]>("public/data/mensal.json");
const texto = (s: string) => s.replace(/\s/g, " ");
const detalhe = (id: string) =>
  construirDetalhe(impacto, projetos, contexto, meses, id);

describe("recursosJanOut", () => {
  // Os mesmos valores que o gabarito impacto.recursos do Dan (origin/main, 88a25ba).
  it("P07: 1457,30 € e 33,41 horas por beneficiário, só de janeiro a outubro", () => {
    const r = recursosJanOut(meses, "P07");
    expect(r.meses).toBe(20);
    expect(r.custoPorBeneficiario).toBeCloseTo(1457.3, 2);
    expect(r.horasPorBeneficiario).toBeCloseTo(33.41, 2);
  });

  it("P01: 4546,04 € e 61,20 horas por beneficiário", () => {
    const r = recursosJanOut(meses, "P01");
    expect(r.custoPorBeneficiario).toBeCloseTo(4546.04, 2);
    expect(r.horasPorBeneficiario).toBeCloseTo(61.2, 2);
  });

  it("deixa novembro e dezembro de fora", () => {
    const todos = meses.filter((m) => m.projeto === "P07");
    const janOut = todos.filter((m) => !m.fimDeAno);
    const r = recursosJanOut(meses, "P07");
    expect(r.despesa).toBeCloseTo(
      janOut.reduce((s, m) => s + m.despesa, 0),
      6,
    );
    expect(r.despesa).toBeLessThan(todos.reduce((s, m) => s + m.despesa, 0));
  });
});

describe("construirDetalhe", () => {
  const v = detalhe("P07");

  it("resumo: o quê sem dado, onde com a região, o formato e o público sem dado", () => {
    expect(v?.resumo.map((l) => l.rotulo)).toEqual([
      "O quê",
      "Objetivo declarado",
      "Onde",
      "Formato",
      "Público",
    ]);
    expect(v?.resumo[2].texto).toBe("Senegal, Dakar (África).");
    expect(v?.resumo[4]).toMatchObject({
      texto: "Sem dado: pedir ao parceiro.",
      semDado: true,
    });
    expect(texto(v?.resumo[3].texto ?? "")).toBe(
      "Cerca de 38 participantes e 5,6 horas por atividade, de janeiro a outubro.",
    );
  });

  it("o ponto do mini-mapa é a capital do país", () => {
    expect(v?.ponto).toMatchObject({ latitude: 14.7247, longitude: -17.4734 });
  });

  it("IIS e 4 dimensões; a necessidade com a fonte e o ano", () => {
    expect(v?.dimensoes.map((d) => d.titulo)).toEqual([
      "Necessidade",
      "Escala",
      "Profundidade",
      "Duração",
    ]);
    expect(v?.dimensoes[0].valor).toBe(70);
    expect(v?.fonteNecessidade).toBe(
      "Fonte: Banco Mundial, WDI (SE.LPV.PRIM), 2019. Percentil entre os 12 países.",
    );
  });

  it("recursos: os 5 valores de janeiro a outubro, sem avisos", () => {
    expect(v?.recursos.map((r) => r.rotulo)).toEqual([
      "Despesa",
      "Horas de voluntariado",
      "Beneficiários",
      "Custo por beneficiário",
      "Horas de voluntariado por beneficiário",
    ]);
    expect(texto(v?.recursos[3].valor ?? "")).toBe("1457 €");
    expect(texto(v?.recursos[4].valor ?? "")).toBe("33,4");
    expect(v?.relacao).toContain("De janeiro a outubro");
  });

  it("saúde: as 5 lentes com nível e frase", () => {
    expect(v?.saude.map((s) => s.lente)).toEqual([
      "Relevância",
      "Eficácia",
      "Eficiência",
      "Impacto",
      "Sustentabilidade",
    ]);
    expect(v?.saude[0]).toMatchObject({
      nivel: "a rever",
      nivelTexto: "A rever",
    });
    expect(v?.saude.every((s) => s.frase.length > 0)).toBe(true);
  });

  it("evolução: todos os meses, com novembro e dezembro marcados", () => {
    const fim = v?.evolucao.meses.filter((m) => m.fimDeAno) ?? [];
    expect(v?.evolucao.meses).toHaveLength(24);
    expect(fim.map((m) => m.mes)).toEqual([
      "2024-11",
      "2024-12",
      "2025-11",
      "2025-12",
    ]);
  });

  it("pontos: só os desta ação (sem o fim de ano nem o dia 27)", () => {
    const ids = v?.pontos.map((p) => p.id);
    expect(ids).toContain("objetivoArea");
    expect(ids).not.toContain("fimDeAno");
    expect(ids).not.toContain("dia27");
    // P07: correções em 2,7% da despesa, acima da mediana das 12
    expect(ids).toContain("estornos");
  });

  it("P01: custo por atividade com a ação de comparação; correções acima da mediana", () => {
    const p = detalhe("P01")?.pontos ?? [];
    const custo = p.find((x) => x.id === "custoAtividade");
    expect(custo?.texto).toContain("4,7 vezes");
    expect(custo?.texto).toContain("P07 e P10");
    expect(custo?.texto).toContain("Pedir o detalhe das maiores despesas");
    expect(p.find((x) => x.id === "estornos")?.texto).toContain("referência");
  });

  it("P04: correções abaixo da mediana, por isso sem esse ponto", () => {
    expect(detalhe("P04")?.pontos.map((p) => p.id)).toEqual(["objetivoArea"]);
  });

  it("o email leva os 5 pedidos e os pontos a confirmar", () => {
    const corpo = decodeURIComponent(v?.mailto.split("body=")[1] ?? "");
    const assunto = decodeURIComponent(
      v?.mailto.split("subject=")[1].split("&")[0] ?? "",
    );
    expect(v?.mailto.startsWith("mailto:?subject=")).toBe(true);
    expect(assunto).toBe("Pedido de informação sobre o Projeto 07");
    for (const p of PEDIDOS_PARCEIRO) expect(corpo).toContain(p);
    expect(corpo).toContain("E que nos ajudem a confirmar:");
    expect(v?.pedidos).toHaveLength(5);
  });

  it("o que aprendemos: 3 frases", () => {
    expect(v?.aprendemos).toHaveLength(3);
  });

  it("uma ação que não existe dá null", () => {
    expect(detalhe("P99")).toBeNull();
  });
});
