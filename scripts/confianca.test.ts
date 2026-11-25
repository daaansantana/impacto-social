import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { auditar } from "@/lib/auditor";
import { lerCsv } from "@/lib/csv";
import { construirAuditoria, projetoDoFicheiro } from "@/lib/vista-auditor";
import { construirConfianca } from "@/lib/vista-confianca";
import type { Projeto, Qualidade } from "@/types";

const ler = (c: string) => readFileSync(c, "utf-8");
const qualidade = JSON.parse(ler("public/data/qualidade.json")) as Qualidade;
const projetos = JSON.parse(ler("public/data/projetos.json")) as Projeto[];
const G = JSON.parse(ler("scripts/gabaritos.json")) as {
  auditor: Record<string, Record<string, unknown>>;
};
const texto = (s: string) => s.replace(/ /g, " ");

describe("construirConfianca", () => {
  const v = construirConfianca(qualidade);
  it("a nota genérica contra a real", () => {
    expect(v.notaGenerica.nota).toBe("A");
    expect(v.notaReal).toBe("2 a 4");
    expect(v.scorecard).toHaveLength(6);
    expect(v.conclusao).toBe(
      "A validação genérica dá nota A às 10 tabelas. Olhando de perto, a qualidade fica entre 2 e 4 em 5: há 4 padrões que a nota não vê.",
    );
  });
  it("a limpeza e os padrões", () => {
    expect(texto(v.limpeza[0].quantidade)).toBe("3591 de 18 000 (20,0%)");
    expect(v.padroes.map((p) => p.id)).toEqual([
      "fimDeAno",
      "dia27",
      "semana",
      "voluntarios",
    ]);
    expect(texto(v.padroes[0].numero)).toBe(
      "Atividades +56%, beneficiários +64%, despesa −6%.",
    );
    expect(texto(v.padroes[1].numero)).toBe(
      "0 de 47 781 registos nos dias 28 a 31; eram de esperar cerca de 5425.",
    );
    expect(v.voluntarios).toHaveLength(24);
    expect(v.fimDeAno.map((f) => Math.round(f.novDez))).toEqual([156, 164, 94]);
  });
});

describe("lerCsv", () => {
  it("recusa um ficheiro vazio, sem «;» ou só com cabeçalho", () => {
    expect(lerCsv("").ok).toBe(false);
    expect(lerCsv("a,b,c\n1,2,3").ok).toBe(false);
    expect(lerCsv("a;b;c\n").ok).toBe(false);
  });
});

describe("construirAuditoria com os ficheiros de demonstração", () => {
  for (const ficheiro of Object.keys(G.auditor))
    it(`${ficheiro} bate com os gabaritos`, () => {
      const leitura = lerCsv(ler(`public/demo/${ficheiro}`));
      if (!leitura.ok) throw new Error(leitura.erro);
      const r = auditar(leitura.linhas);
      const { domingo, ...resto } = r;
      const { domingo: d, ...esperado } = G.auditor[ficheiro];
      expect(resto).toEqual(esperado);
      expect(Math.abs((domingo ?? 0) - (d as number))).toBeLessThanOrEqual(
        0.01,
      );
      const v = construirAuditoria(
        r,
        ficheiro,
        projetoDoFicheiro(leitura.linhas, projetos),
      );
      expect(v.projeto).toBe("Projeto 07 (P07)");
      expect(
        v.mailto?.startsWith(
          "mailto:?subject=O%20ficheiro%20do%20Projeto%2007",
        ),
      ).toBe(true);
    });

  it("os cartões do ficheiro de atividades", () => {
    const leitura = lerCsv(ler("public/demo/atividades-P07.csv"));
    if (!leitura.ok) throw new Error(leitura.erro);
    const v = construirAuditoria(
      auditar(leitura.linhas),
      "atividades-P07.csv",
      null,
    );
    expect(texto(v.resumo)).toBe(
      "atividades-P07.csv: 2342 linhas, 6 coisas a corrigir.",
    );
    const picos = v.cartoes.find((c) => c.titulo === "Picos");
    expect(picos?.detalhe).toBe(
      "nov 2024, dez 2024, nov 2025, dez 2025: pelo menos 1,3 vezes a mediana dos meses.",
    );
    expect(v.mailto).toBeNull();
  });
});
