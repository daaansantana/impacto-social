import { numero, percentagem } from "@/lib/format";
import { mensagemParceiro } from "@/lib/mensagem";
import { nomeMes } from "@/lib/vista-projeto";
import type { Projeto, ResultadoAuditoria } from "@/types";

export type Cartao = {
  titulo: string;
  valor: string;
  detalhe?: string;
  /** "aviso" quando há alguma coisa a corrigir */
  tom: "ok" | "aviso";
};

export type VistaAuditoria = {
  ficheiro: string;
  resumo: string;
  cartoes: Cartao[];
  projeto: string | null;
  /** o mailto do email ao parceiro, ou null se o ficheiro não diz de que projeto é */
  mailto: string | null;
};

/** O projeto mais frequente no ficheiro, se existir nos dados. */
export function projetoDoFicheiro(
  linhas: Record<string, string>[],
  projetos: Projeto[],
): Projeto | null {
  const vezes = new Map<string, number>();
  for (const l of linhas)
    if (l.id_projeto)
      vezes.set(l.id_projeto, (vezes.get(l.id_projeto) ?? 0) + 1);
  const [id] = [...vezes].sort((a, b) => b[1] - a[1])[0] ?? [];
  return projetos.find((p) => p.id === id) ?? null;
}

/** «Assunto: …» na primeira linha passa a assunto; o resto é o corpo. */
export function mailtoDe(texto: string): string {
  const [primeira, ...resto] = texto.split("\n");
  const assunto = primeira.replace(/^Assunto:\s*/, "");
  const corpo = resto.join("\n").replace(/^\n+/, "");
  return `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

/** Os resultados do auditor em cartões, com o email ao parceiro. */
export function construirAuditoria(
  r: ResultadoAuditoria,
  ficheiro: string,
  projeto: Projeto | null,
): VistaAuditoria {
  const cartoes: Cartao[] = [];
  const conta = (n: number, um: string, varios: string) =>
    `${numero(n)} ${n === 1 ? um : varios}`;

  if (r.datas) {
    const { iso, ddmm, outro } = r.datas;
    cartoes.push({
      titulo: "Formato das datas",
      valor:
        ddmm + outro === 0
          ? "Todas em AAAA-MM-DD"
          : conta(ddmm + outro, "data noutro formato", "datas noutro formato"),
      detalhe: `${numero(iso)} em AAAA-MM-DD, ${numero(ddmm)} em DD/MM/AAAA e ${numero(outro)} que não se leem.`,
      tom: ddmm + outro === 0 ? "ok" : "aviso",
    });
  }
  if (r.diaMaximo !== undefined)
    cartoes.push({
      titulo: "Fim do mês",
      valor: r.dias28a31
        ? conta(
            r.dias28a31,
            "registo nos dias 28 a 31",
            "registos nos dias 28 a 31",
          )
        : `Nenhum registo depois do dia ${r.diaMaximo}`,
      detalhe:
        "Num mês normal, cerca de 11% dos registos cairiam nos dias 28 a 31.",
      tom: r.diaMaximo < 28 ? "aviso" : "ok",
    });
  if (r.domingo !== undefined)
    cartoes.push({
      titulo: "Domingos",
      valor: `${percentagem(r.domingo, 2)} das datas`,
      detalhe: "Ao acaso, um dia em sete (14,3%) cairia ao domingo.",
      tom: r.domingo > 0 ? "aviso" : "ok",
    });
  if (r.picos)
    cartoes.push({
      titulo: "Picos",
      valor: r.picos.length
        ? conta(r.picos.length, "mês com um pico", "meses com um pico")
        : "Nenhum pico",
      detalhe: r.picos.length
        ? `${r.picos.map(nomeMes).join(", ")}: pelo menos 1,3 vezes a mediana dos meses.`
        : undefined,
      tom: r.picos.length ? "aviso" : "ok",
    });
  if (r.negativos !== undefined)
    cartoes.push({
      titulo: "Valores negativos",
      valor: conta(r.negativos, "valor", "valores"),
      detalhe: r.negativos
        ? "São estornos? Pedir ao parceiro a despesa a que se referem."
        : undefined,
      tom: r.negativos ? "aviso" : "ok",
    });
  if (r.idsRepetidos !== undefined)
    cartoes.push({
      titulo: "Ids repetidos",
      valor: conta(r.idsRepetidos, "linha", "linhas"),
      detalhe: r.linhasIguais
        ? `${conta(r.linhasIguais, "linha repete", "linhas repetem")} outra por inteiro.`
        : undefined,
      tom: r.idsRepetidos || r.linhasIguais ? "aviso" : "ok",
    });
  if (r.refsInvalidas !== undefined)
    cartoes.push({
      titulo: "Projetos que não existem",
      valor: conta(r.refsInvalidas, "linha", "linhas"),
      tom: r.refsInvalidas ? "aviso" : "ok",
    });
  cartoes.push({
    titulo: "Grafias diferentes",
    valor: r.grafias.length
      ? conta(r.grafias.length, "grupo", "grupos")
      : "Nenhuma",
    detalhe: r.grafias.length
      ? r.grafias
          .map(
            (g) =>
              `${g.coluna}: ${g.variantes.map((v) => `«${v}»`).join(" e ")}`,
          )
          .join("; ")
      : undefined,
    tom: r.grafias.length ? "aviso" : "ok",
  });
  const vazios = Object.entries(r.vazios);
  cartoes.push({
    titulo: "Valores vazios",
    valor: vazios.length
      ? conta(
          vazios.reduce((s, [, n]) => s + n, 0),
          "valor",
          "valores",
        )
      : "Nenhum",
    detalhe: vazios.length
      ? vazios.map(([c, n]) => `${c}: ${numero(n)}`).join("; ")
      : undefined,
    tom: vazios.length ? "aviso" : "ok",
  });

  const avisos = cartoes.filter((c) => c.tom === "aviso").length;
  return {
    ficheiro,
    resumo: `${ficheiro}: ${conta(r.linhas, "linha", "linhas")}, ${avisos ? conta(avisos, "coisa a corrigir", "coisas a corrigir") : "nada a corrigir"}.`,
    cartoes,
    projeto: projeto ? `${projeto.nome} (${projeto.id})` : null,
    mailto: projeto ? mailtoDe(mensagemParceiro(r, projeto)) : null,
  };
}
