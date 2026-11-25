import type { Grafia, ResultadoAuditoria } from "@/types";

// As regras estão em docs/SPEC.md, secção 4.

const PROJETOS = new Set(
  Array.from({ length: 12 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`),
);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DDMM = /^\d{2}\/\d{2}\/\d{4}$/;
const ANO_MES = /^\d{4}-\d{2}$/;
const MILHARES = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/;

type Data = { ano: number; mes: number; dia: number; domingo: boolean };

/** Lê AAAA-MM-DD, DD/MM/AAAA e AAAA-MM (dia 1). */
function lerData(texto: string): Data | null {
  const s = texto.trim();
  let ano: number;
  let mes: number;
  let dia: number;
  if (ISO.test(s)) [ano, mes, dia] = s.split("-").map(Number);
  else if (DDMM.test(s)) [dia, mes, ano] = s.split("/").map(Number);
  else if (ANO_MES.test(s)) {
    [ano, mes] = s.split("-").map(Number);
    dia = 1;
  } else return null;
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null;
  return { ano, mes, dia, domingo: data.getUTCDay() === 0 };
}

/** `1.234,56` → 1234.56; `12,5` → 12.5; vazio ou inválido → null. */
export function lerNumero(texto: string): number | null {
  const s = texto.trim();
  if (s === "") return null;
  const n = Number(
    MILHARES.test(s)
      ? s.replaceAll(".", "").replace(",", ".")
      : s.replace(",", "."),
  );
  return Number.isNaN(n) ? null : n;
}

/** Sem acentos, em minúsculas e com um só espaço. */
const normalizar = (texto: string) =>
  texto
    .normalize("NFKD")
    .replace(/[^\p{ASCII}]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const mediana = (valores: number[]) => {
  const v = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(v.length / 2);
  return v.length % 2 ? v[meio] : (v[meio - 1] + v[meio]) / 2;
};

const duasCasas = (x: number) => Math.round(x * 100) / 100;

/** Os problemas de um CSV do parceiro: as linhas vêm do Papa Parse, tudo como texto. */
export function auditar(linhas: Record<string, string>[]): ResultadoAuditoria {
  const colunas = linhas.length ? Object.keys(linhas[0]) : [];
  const valor = (linha: Record<string, string>, coluna: string) =>
    linha[coluna] ?? "";
  const resultado: ResultadoAuditoria = {
    linhas: linhas.length,
    linhasIguais: 0,
    grafias: [],
    vazios: {},
  };

  const colunaData = ["data", "data_inicio", "periodo"].find((c) =>
    colunas.includes(c),
  );
  if (colunaData) {
    const datas = { iso: 0, ddmm: 0, outro: 0 };
    const lidas: Data[] = [];
    for (const linha of linhas) {
      const s = valor(linha, colunaData).trim();
      if (ISO.test(s)) datas.iso++;
      else if (DDMM.test(s)) datas.ddmm++;
      else datas.outro++;
      const data = lerData(s);
      if (data) lidas.push(data);
    }
    const porMes = new Map<string, number>();
    for (const d of lidas) {
      const chave = `${d.ano}-${String(d.mes).padStart(2, "0")}`;
      porMes.set(chave, (porMes.get(chave) ?? 0) + 1);
    }
    const limite = 1.3 * mediana([...porMes.values()]);
    resultado.datas = datas;
    resultado.dias28a31 = lidas.filter((d) => d.dia >= 28).length;
    resultado.diaMaximo = Math.max(0, ...lidas.map((d) => d.dia));
    resultado.domingo = lidas.length
      ? duasCasas((lidas.filter((d) => d.domingo).length / lidas.length) * 100)
      : 0;
    resultado.picos = [...porMes]
      .filter(([, n]) => n >= limite)
      .map(([mes]) => mes)
      .sort();
  }

  if (colunas.includes("valor"))
    resultado.negativos = linhas.filter(
      (l) => (lerNumero(valor(l, "valor")) ?? 0) < 0,
    ).length;

  if (colunas.includes("id")) {
    const vezes = new Map<string, number>();
    for (const l of linhas) vezes.set(l.id, (vezes.get(l.id) ?? 0) + 1);
    resultado.idsRepetidos = linhas.filter(
      (l) => (vezes.get(l.id) ?? 0) > 1,
    ).length;
  }

  const diferentes = new Set(
    linhas.map((l) => JSON.stringify(colunas.map((c) => valor(l, c)))),
  );
  resultado.linhasIguais = linhas.length - diferentes.size;

  if (colunas.includes("id_projeto"))
    resultado.refsInvalidas = linhas.filter(
      (l) => !PROJETOS.has(l.id_projeto),
    ).length;

  const grafias: Grafia[] = [];
  for (const coluna of colunas) {
    const valores = new Set(
      linhas.map((l) => valor(l, coluna)).filter((v) => v.trim() !== ""),
    );
    const fora =
      coluna === "id" ||
      coluna.startsWith("id_") ||
      coluna === "data" ||
      coluna === "valor" ||
      valores.size > 40;
    if (fora) continue;
    const grupos = new Map<string, string[]>();
    for (const v of valores) {
      const chave = normalizar(v);
      grupos.set(chave, [...(grupos.get(chave) ?? []), v]);
    }
    for (const [, variantes] of [...grupos].sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    ))
      if (variantes.length > 1)
        grafias.push({ coluna, variantes: variantes.sort() });
  }
  resultado.grafias = grafias;

  for (const coluna of colunas) {
    const vazios = linhas.filter((l) => valor(l, coluna).trim() === "").length;
    if (vazios) resultado.vazios[coluna] = vazios;
  }

  return resultado;
}
