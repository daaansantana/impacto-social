import { numero, percentagem } from "@/lib/format";
import type { Projeto, ResultadoAuditoria } from "@/types";

const vezes = (n: number, singular: string, plural: string) =>
  `${numero(n)} ${n === 1 ? singular : plural}`;

/** O email ao parceiro com o que corrigir no ficheiro. */
export function mensagemParceiro(
  resultado: ResultadoAuditoria,
  projeto: Projeto,
): string {
  const r = resultado;
  const pedidos: string[] = [];

  if (r.datas?.ddmm)
    pedidos.push(
      `${vezes(r.datas.ddmm, "data está", "datas estão")} em DD/MM/AAAA. Usem sempre AAAA-MM-DD.`,
    );
  if (r.datas?.outro)
    pedidos.push(
      `${vezes(r.datas.outro, "data não se lê", "datas não se leem")}. Usem AAAA-MM-DD.`,
    );
  if (r.diaMaximo !== undefined && r.linhas > 0 && r.diaMaximo < 28)
    pedidos.push(
      `Nenhum registo passa do dia ${r.diaMaximo}. Confirmem se os registos dos dias 28 a 31 ficaram de fora.`,
    );
  if (r.domingo)
    pedidos.push(
      `${percentagem(r.domingo, 2)} das datas caem a um domingo. Confirmem se são as datas reais.`,
    );
  if (r.picos?.length)
    pedidos.push(
      `Em ${r.picos.join(", ")} há pelo menos 1,3 vezes os registos de um mês normal. Confirmem se não há registos a mais.`,
    );
  if (r.negativos)
    pedidos.push(
      `${vezes(r.negativos, "valor é negativo", "valores são negativos")}. Digam se são estornos e a que despesa se referem.`,
    );
  if (r.linhasIguais)
    pedidos.push(
      `${vezes(r.linhasIguais, "linha repete", "linhas repetem")} outra linha por inteiro. Enviem cada registo uma só vez.`,
    );
  else if (r.idsRepetidos)
    pedidos.push(
      `${vezes(r.idsRepetidos, "linha tem", "linhas têm")} um id repetido. Cada registo precisa do seu id.`,
    );
  if (r.refsInvalidas)
    pedidos.push(
      `${vezes(r.refsInvalidas, "linha aponta", "linhas apontam")} para um projeto que não existe.`,
    );
  for (const g of r.grafias)
    pedidos.push(
      `Na coluna ${g.coluna}, o mesmo valor aparece escrito de formas diferentes: ${g.variantes.map((v) => `«${v}»`).join(", ")}. Escolham uma.`,
    );
  for (const [coluna, n] of Object.entries(r.vazios))
    pedidos.push(
      `A coluna ${coluna} tem ${vezes(n, "valor vazio", "valores vazios")}.`,
    );

  const nome = `${projeto.nome} (${projeto.id})`;
  const corpo = pedidos.length
    ? [
        `Revimos o ficheiro que enviaram para o ${nome}. Antes de o usarmos, pedimos que vejam o seguinte:`,
        "",
        ...pedidos.map((p) => `- ${p}`),
        "",
        "Quando estiver corrigido, enviem-nos o ficheiro outra vez, por favor.",
      ]
    : [
        `Revimos o ficheiro que enviaram para o ${nome} e não encontrámos nada a corrigir.`,
      ];

  return [
    `Assunto: O ficheiro do ${nome}`,
    "",
    "Olá,",
    "",
    ...corpo,
    "",
    "Obrigada,",
    "Helena Duarte",
  ].join("\n");
}
