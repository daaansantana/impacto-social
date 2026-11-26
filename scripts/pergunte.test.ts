import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { type RespostaLupa, respostasLupa } from "@/lib/pergunte";
import type { Contexto, ImpactoAcao, Projeto, RadarCelula } from "@/types";

// As 4 respostas guiadas, com os dados reais de public/data.
const ler = <T>(c: string) => JSON.parse(readFileSync(c, "utf-8")) as T;
const respostas = respostasLupa({
  impacto: ler<ImpactoAcao[]>("public/data/impacto.json"),
  projetos: ler<Projeto[]>("public/data/projetos.json"),
  contexto: ler<Contexto[]>("public/data/contexto.json"),
  radar: ler<RadarCelula[]>("public/data/radar.json"),
});
const texto = (s: string) => s.replace(/\s/g, " ");
const por = (id: RespostaLupa["id"]) => {
  const r = respostas.find((x) => x.id === id);
  if (!r) throw new Error(id);
  return r;
};

describe("Pergunte à Lupa", () => {
  it("as 4 perguntas sugeridas, por esta ordem", () => {
    expect(respostas.map((r) => r.pergunta)).toEqual([
      "Que ação tem mais impacto em África?",
      "Onde abrir um projeto de saúde?",
      "O que devo confirmar com os parceiros?",
      "E se eu quiser chegar a mais pessoas?",
    ]);
  });

  it("1. África: rankingIIS só com as 5 ações em África; o P11 (Uganda), 73 em 100", () => {
    const r = por("africa");
    expect(r.passos.map((p) => p.ferramenta)).toEqual(["rankingIIS"]);
    expect(r.passos[0].entrada).toBe(
      "as 5 ações em África e os pesos «Equilibrado»",
    );
    expect(r.passos[0].resultado.map((l) => l.texto)).toEqual([
      "1.º Projeto 11 (Uganda, logística): 73 em 100",
      "2.º Projeto 12 (Moçambique, tecnologia): 69 em 100",
      "3.º Projeto 02 (Quénia, formação): 66 em 100",
    ]);
    expect(r.resposta).toBe(
      "O Projeto 11 (Uganda, logística) tem o maior impacto em África: 73 em 100.",
    );
  });

  it("2. Saúde: o Radar, com Moçambique em 1.º", () => {
    const r = por("saude");
    expect(r.passos.map((p) => p.ferramenta)).toEqual(["ondeFariaDiferenca"]);
    const linhas = r.passos[0].resultado.map((l) => texto(l.texto));
    expect(linhas[0]).toBe(
      "1.º Moçambique: 1.º com mais necessidade em saúde, entre 12 países com dado; evidência de 56,1 em 100, estimada a partir de 2 ações",
    );
    expect(linhas.map((l) => l.split(":")[0])).toEqual([
      "1.º Moçambique",
      "2.º Uganda",
      "3.º Quénia",
    ]);
    expect(r.resposta).toBe(
      "Em Moçambique: é o país com mais necessidade em saúde, entre os 12 com dado, e ainda não tem nenhuma ação de saúde.",
    );
  });

  it("3. Parceiros: precisaAtencao dá o P03, o P01 e o P02, cada um com os seus pontos", () => {
    const r = por("confirmar");
    expect(r.passos.map((p) => p.ferramenta)).toEqual(["precisaAtencao"]);
    const [p03, p01, p02] = r.passos[0].resultado;
    expect(r.passos[0].resultado.map((l) => l.texto)).toEqual([
      "Projeto 03 (Índia, saúde): 2 pontos",
      "Projeto 01 (Brasil, educação): 2 pontos",
      "Projeto 02 (Quénia, formação): 2 pontos",
    ]);
    expect(p03.detalhes?.[0]).toMatch(
      /^Cada atividade custa 2,0 vezes mais do que na outra ação de saúde \(P09\)/,
    );
    expect(p01.detalhes?.[1]).toBe(
      "O objetivo declarado é «ampliar cobertura de saude preventiva», mas a área é educação. Confirmar qual vale para medir o impacto.",
    );
    expect(p02.detalhes).toHaveLength(2);
    expect(r.resposta).toBe(
      "Comece pelo Projeto 03 e siga para o Projeto 01 e o Projeto 02: cada um tem 2 pontos a confirmar.",
    );
  });

  it("4. Mais pessoas: rankingIIS com «Chegar a mais pessoas»; o P01 passa a 1.º", () => {
    const r = por("maisPessoas");
    expect(r.passos.map((p) => p.ferramenta)).toEqual([
      "rankingIIS",
      "rankingIIS",
    ]);
    expect(r.passos[1].entrada).toBe(
      "as 12 ações e os pesos «Chegar a mais pessoas» (necessidade 15, escala 50, profundidade 20 e duração 15)",
    );
    expect(r.passos[1].resultado.map((l) => l.texto)).toEqual([
      "1.º Projeto 01 (Brasil, educação): 71 em 100",
      "2.º Projeto 12 (Moçambique, tecnologia): 71 em 100",
      "3.º Projeto 02 (Quénia, formação): 67 em 100",
    ]);
    // com os pesos equilibrados, o P01 não está nos 3 primeiros: aparece à parte
    expect(r.passos[0].resultado.at(-1)?.texto).toMatch(/^\d+\.º Projeto 01 /);
    expect(r.resposta).toMatch(
      /^Com os pesos «Chegar a mais pessoas», o Projeto 01 \(Brasil, educação\) passa de \d+\.º a 1\.º, com 71 em 100, à frente do Projeto 12 por menos de um ponto\.$/,
    );
  });

  it("sem «percentil» nas respostas", () => {
    const tudo = JSON.stringify(respostas);
    expect(tudo).not.toMatch(/percentil/i);
  });
});
