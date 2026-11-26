import { juntarAcoes, precisaAtencao } from "@/lib/acoes";
import { arredondar, numero } from "@/lib/format";
import { PREDEFINICOES, rankingIIS } from "@/lib/iis";
import { nomeArea, nomePais } from "@/lib/nomes";
import { ondeFariaDiferenca, posicaoNecessidade } from "@/lib/radar";
import type { Dados } from "@/types";

// «Pergunte à Lupa» (protótipo, docs/PLANO-V2.md, D6): 4 perguntas sugeridas, respondidas com as funções de lib/.
// Sem chave de API: as respostas são guiadas. Com uma chave, o AI SDK chama estas mesmas funções como ferramentas.

/** Um passo de ferramenta: a função de lib/ chamada, com o quê, e o que devolveu. */
export type PassoLupa = {
  ferramenta: string;
  entrada: string;
  resultado: { texto: string; detalhes?: string[] }[];
};

export type RespostaLupa = {
  id: "africa" | "saude" | "confirmar" | "maisPessoas";
  pergunta: string;
  passos: PassoLupa[];
  /** a resposta numa frase */
  resposta: string;
};

const EQUILIBRADO = PREDEFINICOES.equilibrado;
const MAIS_PESSOAS = PREDEFINICOES.chegarAMaisPessoas;
const pontos = (n: number) => (n === 1 ? "1 ponto" : `${n} pontos`);
const pesosTexto = ({ pesos }: { pesos: Record<string, number> }) =>
  `necessidade ${pesos.necessidade}, escala ${pesos.escala}, profundidade ${pesos.profundidade} e duração ${pesos.duracao}`;

/** As 4 respostas, com os passos de ferramenta; o IIS em inteiro, como no resto da app. */
export function respostasLupa(
  dados: Pick<Dados, "impacto" | "projetos" | "contexto" | "radar">,
): RespostaLupa[] {
  const acoes = juntarAcoes(dados.impacto, dados.projetos, dados.contexto);
  const porId = new Map(acoes.map((a) => [a.projeto, a]));
  const quem = (id: string) => {
    const a = porId.get(id);
    return a ? `${a.nome} (${nomePais(a.pais)}, ${nomeArea(a.area)})` : id;
  };
  const linha = (l: { projeto: string; iis: number; posicao: number }) => ({
    texto: `${l.posicao}.º ${quem(l.projeto)}: ${numero(l.iis)} em 100`,
  });
  const respostas: RespostaLupa[] = [];

  // 1. Que ação tem mais impacto em África?
  const africa = acoes.filter((a) => a.regiao === "África");
  const rankAfrica = rankingIIS(africa, EQUILIBRADO.pesos);
  const [primeira] = rankAfrica;
  respostas.push({
    id: "africa",
    pergunta: "Que ação tem mais impacto em África?",
    passos: [
      {
        ferramenta: "rankingIIS",
        entrada: `as ${africa.length} ações em África e os pesos «${EQUILIBRADO.rotulo}»`,
        resultado: rankAfrica.slice(0, 3).map(linha),
      },
    ],
    resposta: primeira
      ? `O ${quem(primeira.projeto)} tem o maior impacto em África: ${numero(primeira.iis)} em 100.`
      : "Não há ações em África.",
  });

  // 2. Onde abrir um projeto de saúde?
  const saude = dados.radar.filter((c) => c.area === "saude");
  const onde = ondeFariaDiferenca(saude, 3);
  const posicaoTexto = (c: (typeof saude)[number]) => {
    const p = posicaoNecessidade(saude, c);
    return p
      ? `${p.posicao}.º com mais necessidade em saúde, entre ${p.comDado} países com dado`
      : "sem dado de necessidade";
  };
  const [melhor] = onde;
  const posMelhor = melhor ? posicaoNecessidade(saude, melhor) : null;
  respostas.push({
    id: "saude",
    pergunta: "Onde abrir um projeto de saúde?",
    passos: [
      {
        ferramenta: "ondeFariaDiferenca",
        entrada:
          "o Radar da saúde: os países a reforçar que ainda não têm ação de saúde, da maior necessidade para a menor",
        resultado: onde.map((c, i) => ({
          texto: `${i + 1}.º ${nomePais(c.pais)}: ${posicaoTexto(c)}; evidência de ${numero(c.evidencia, 1)} em 100, estimada a partir de ${c.n} ações`,
        })),
      },
    ],
    resposta: melhor
      ? `Em ${nomePais(melhor.pais)}: é o ${posMelhor && posMelhor.posicao > 1 ? `${posMelhor.posicao}.º ` : ""}país com mais necessidade em saúde${posMelhor ? `, entre os ${posMelhor.comDado} com dado` : ""}, e ainda não tem nenhuma ação de saúde.`
      : "Nenhum país sem ação de saúde está na zona a reforçar.",
  });

  // 3. O que devo confirmar com os parceiros?
  const atencao = precisaAtencao(acoes, EQUILIBRADO.pesos);
  const contagens = new Set(atencao.map((a) => a.pontos.length));
  const [a1, ...resto] = atencao;
  const seguir = resto.map((a) => `o ${a.nome}`);
  const lista =
    seguir.length > 1
      ? `${seguir.slice(0, -1).join(", ")} e ${seguir.at(-1)}`
      : (seguir[0] ?? "");
  const total = atencao.reduce((s, a) => s + a.pontos.length, 0);
  respostas.push({
    id: "confirmar",
    pergunta: "O que devo confirmar com os parceiros?",
    passos: [
      {
        ferramenta: "precisaAtencao",
        entrada: `as ${acoes.length} ações: mais pontos primeiro e, num empate, o menor impacto`,
        resultado: atencao.map((a) => ({
          texto: `${quem(a.projeto)}: ${pontos(a.pontos.length)}`,
          detalhes: a.pontos.map((p) => p.texto),
        })),
      },
    ],
    resposta: !a1
      ? "Nenhuma ação tem pontos a confirmar com os parceiros."
      : `Comece pelo ${a1.nome}${lista ? ` e siga para ${lista}` : ""}: ${
          atencao.length === 1
            ? `tem ${pontos(a1.pontos.length)} a confirmar.`
            : contagens.size === 1
              ? `cada um tem ${pontos(a1.pontos.length)} a confirmar.`
              : `são ${pontos(total)} a confirmar.`
        }`,
  });

  // 4. E se eu quiser chegar a mais pessoas?
  const antes = rankingIIS(acoes, EQUILIBRADO.pesos);
  const depois = rankingIIS(acoes, MAIS_PESSOAS.pesos);
  const [novo, segundo] = depois;
  const posAntes = antes.find((l) => l.projeto === novo?.projeto)?.posicao;
  const topo = (r: typeof antes, destaque?: string) => {
    const linhas = r.slice(0, 3);
    const extra = r.find((l) => l.projeto === destaque && l.posicao > 3);
    return [...linhas, ...(extra ? [extra] : [])].map(linha);
  };
  const folga =
    novo && segundo && arredondar(novo.iis - segundo.iis, 2) < 1
      ? `, à frente do ${porId.get(segundo.projeto)?.nome ?? segundo.projeto} por menos de um ponto`
      : "";
  respostas.push({
    id: "maisPessoas",
    pergunta: "E se eu quiser chegar a mais pessoas?",
    passos: [
      {
        ferramenta: "rankingIIS",
        entrada: `as ${acoes.length} ações e os pesos «${EQUILIBRADO.rotulo}» (${pesosTexto(EQUILIBRADO)})`,
        resultado: topo(antes, novo?.projeto),
      },
      {
        ferramenta: "rankingIIS",
        entrada: `as ${acoes.length} ações e os pesos «${MAIS_PESSOAS.rotulo}» (${pesosTexto(MAIS_PESSOAS)})`,
        resultado: topo(depois),
      },
    ],
    resposta: !novo
      ? "Não há ações para ordenar."
      : posAntes === 1
        ? `Com os pesos «${MAIS_PESSOAS.rotulo}», o ${quem(novo.projeto)} continua em 1.º, com ${numero(novo.iis)} em 100.`
        : `Com os pesos «${MAIS_PESSOAS.rotulo}», o ${quem(novo.projeto)} passa de ${posAntes}.º a 1.º, com ${numero(novo.iis)} em 100${folga}.`,
  });

  return respostas;
}
