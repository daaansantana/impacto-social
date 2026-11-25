// Um fetch por ficheiro de public/data. Sem estado: a store guarda o resultado.
import type { Mes, Plano, Projeto, Qualidade } from "@/types";

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
