import Papa from "papaparse";

export type LeituraCsv =
  | { ok: true; linhas: Record<string, string>[]; colunas: string[] }
  | { ok: false; erro: string };

/** Lê o CSV de um parceiro como a SPEC pede: cabeçalho, «;» e tudo como texto. */
export function lerCsv(texto: string): LeituraCsv {
  if (texto.trim() === "") return { ok: false, erro: "O ficheiro está vazio." };
  const { data, meta } = Papa.parse<Record<string, string>>(texto, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });
  const colunas = meta.fields ?? [];
  if (colunas.length < 2)
    return {
      ok: false,
      erro: "Não encontrei colunas separadas por «;». Os ficheiros dos parceiros usam «;» entre colunas.",
    };
  if (data.length === 0)
    return { ok: false, erro: "O ficheiro só tem o cabeçalho, sem linhas." };
  return { ok: true, linhas: data, colunas };
}
