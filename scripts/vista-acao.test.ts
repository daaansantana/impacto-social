import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { construirAcao } from "@/lib/vista-acao";
import type { Contexto, ImpactoAcao, Mes, Projeto } from "@/types";

const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const dados = {
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
  mensal: ler<Mes[]>("public/data/mensal.json"),
};
const texto = (s: string) => s.replace(/ /g, " ");

describe("construirAcao", () => {
  it("P07: o resumo, o IIS em inteiro e os recursos", () => {
    const v = construirAcao(dados, "P07");
    if (!v) throw new Error("P07 devia existir");
    expect(v.nome).toBe("Projeto 07");
    expect(v.iisTexto).toBe("60");
    expect(v.faixa).toBe("60 ou mais");
    expect(v.resumo.find((r) => r.rotulo === "O quê")?.texto).toBe(
      "Apoio ao estudo, aula e oficina educativa.",
    );
    expect(v.resumo.find((r) => r.rotulo === "Onde")?.texto).toBe(
      "Senegal, África.",
    );
    expect(v.resumo.find((r) => r.rotulo === "Público")?.texto).toBe(
      "Sem dado: pedir ao parceiro.",
    );
    expect(texto(v.relacao)).toBe(
      "De janeiro a outubro, cada beneficiário custou 1457 € e 33,4 horas de voluntariado.",
    );
    expect(v.dimensoes.map((d) => d.id)).toEqual([
      "necessidade",
      "escala",
      "profundidade",
      "duracao",
    ]);
    expect(v.saude).toHaveLength(5);
    expect(v.mailto.startsWith("mailto:?subject=Pedido%20de%20informa")).toBe(
      true,
    );
    expect(v.evolucao.meses).toHaveLength(24);
  });

  it("o IIS do P11 aparece como 73", () => {
    expect(construirAcao(dados, "P11")?.iisTexto).toBe("73");
  });

  it("«forte», «a acompanhar» e «a rever» só na saúde", () => {
    for (const { projeto } of dados.impacto) {
      const v = construirAcao(dados, projeto);
      if (!v) throw new Error(projeto);
      const { saude: _saude, evolucao: _evolucao, ...resto } = v;
      expect(JSON.stringify(resto), projeto).not.toMatch(
        /forte|a acompanhar|a rever/,
      );
    }
  });

  it("uma ação que não existe", () => {
    expect(construirAcao(dados, "P99")).toBeNull();
  });

  it("«percentil» não aparece no ecrã da ação nem nas frases da saúde", () => {
    for (const a of dados.impacto) {
      const v = construirAcao(dados, a.projeto);
      expect(JSON.stringify(v), a.projeto).not.toMatch(/percentil/i);
      for (const l of Object.values(a.saude))
        expect(l.frase, a.projeto).not.toMatch(/percentil/i);
    }
    expect(construirAcao(dados, "P07")?.dimensoes[0].frase).toBe(
      "68,6% das crianças de 10 anos não conseguem ler um texto simples: o Senegal é o 4.º país com mais necessidade em educação, entre os 10 países com dado.",
    );
  });
});
