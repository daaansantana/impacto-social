// Um fetch por ficheiro de public/data. Sem estado: a store guarda o resultado.
import type {
  AtividadesAcao,
  Contexto,
  ImpactoAcao,
  Mes,
  Plano,
  Projeto,
  Qualidade,
  RadarCelula,
} from "@/types";

async function lerJson<T>(ficheiro: string): Promise<T> {
  const resposta = await fetch(`/data/${ficheiro}`);
  if (!resposta.ok) {
    throw new Error(`Não foi possível ler ${ficheiro} (${resposta.status}).`);
  }
  return (await resposta.json()) as T;
}

export const fetchMensal = () => lerJson<Mes[]>("mensal.json");
export const fetchProjetos = () => lerJson<Projeto[]>("projetos.json");
export const fetchPlanos = () => lerJson<Plano[]>("planos.json");
export const fetchQualidade = () => lerJson<Qualidade>("qualidade.json");
export const fetchImpacto = () => lerJson<ImpactoAcao[]>("impacto.json");
export const fetchContexto = () => lerJson<Contexto[]>("contexto.json");
export const fetchRadar = () => lerJson<RadarCelula[]>("radar.json");
export const fetchAtividades = () =>
  lerJson<AtividadesAcao[]>("atividades.json");

/** Um ficheiro de demonstração do auditor, como texto. */
export async function fetchDemo(ficheiro: string): Promise<string> {
  const resposta = await fetch(`/demo/${ficheiro}`);
  if (!resposta.ok) {
    throw new Error(`Não foi possível ler ${ficheiro} (${resposta.status}).`);
  }
  return resposta.text();
}
