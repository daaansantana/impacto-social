// Números em pt-PT (docs/SPEC.md, secção 6): de 0 a 2 casas decimais.

const formatos = new Map<string, Intl.NumberFormat>();
const formato = (chave: string, opcoes: Intl.NumberFormatOptions) => {
  let f = formatos.get(chave);
  if (!f) {
    f = new Intl.NumberFormat("pt-PT", opcoes);
    formatos.set(chave, f);
  }
  return f;
};

/** 1234,5 → «1234,5»; 18878 → «18 878». */
export const numero = (x: number, casas = 0) =>
  formato(`n${casas}`, { maximumFractionDigits: casas }).format(x);

/** 2450,886 → «2450,89 €»; com `casas = 0`, «2451 €». */
export const euros = (x: number, casas = 2) =>
  formato(`e${casas}`, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(x);

/** Milhões de euros, sempre com 2 casas: 41 411 900 → «41,41 M€»; 1 300 715 → «1,30 M€». */
export const milhoes = (x: number) =>
  `${formato("m2", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x / 1e6)} M€`;

/** Uma percentagem de 0 a 100, sempre com `casas` decimais: 15,07 → «15,07%»; 3 com 1 casa → «3,0%». */
export const percentagem = (x: number, casas = 0) =>
  formato(`p${casas}`, {
    style: "percent",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(x / 100);

/** Arredonda com ,5 para cima a partir da forma decimal mais curta do número (como o Decimal do Python). */
export const arredondar = (x: number, casas = 2) =>
  Number(`${Math.round(Number(`${x}e${casas}`))}e-${casas}`);
