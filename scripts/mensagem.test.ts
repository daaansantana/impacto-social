import { describe, expect, it } from "vitest";
import { mensagemParceiro } from "@/lib/mensagem";
import type { Projeto, ResultadoAuditoria } from "@/types";

const projeto = { id: "P07", nome: "Projeto 07" } as Projeto;
const limpo: ResultadoAuditoria = {
  linhas: 10,
  linhasIguais: 0,
  grafias: [],
  vazios: {},
};

describe("mensagemParceiro", () => {
  it("pede só o que o auditor encontrou", () => {
    const texto = mensagemParceiro(
      {
        ...limpo,
        datas: { iso: 7, ddmm: 3, outro: 0 },
        diaMaximo: 27,
        negativos: 1,
        grafias: [{ coluna: "categoria", variantes: ["Pessoal", "pessoal"] }],
        vazios: { descricao: 2 },
      },
      projeto,
    );
    expect(texto).toContain("Assunto: O ficheiro do Projeto 07 (P07)");
    expect(texto).toContain("- 3 datas estão em DD/MM/AAAA.");
    expect(texto).toContain("Nenhum registo passa do dia 27.");
    expect(texto).toContain("- 1 valor é negativo.");
    expect(texto).toContain("«Pessoal», «pessoal»");
    expect(texto).toContain("A coluna descricao tem 2 valores vazios.");
    expect(texto).not.toContain("domingo");
    expect(texto).not.toContain("id repetido");
  });

  it("diz quando não há nada a corrigir", () => {
    expect(mensagemParceiro(limpo, projeto)).toContain(
      "não encontrámos nada a corrigir",
    );
  });
});
