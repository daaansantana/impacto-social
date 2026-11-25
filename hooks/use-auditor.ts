"use client";

import { useState } from "react";
import { auditar } from "@/lib/auditor";
import { lerCsv } from "@/lib/csv";
import {
  construirAuditoria,
  projetoDoFicheiro,
  type VistaAuditoria,
} from "@/lib/vista-auditor";
import { fetchDemo } from "@/services/data";
import type { Projeto } from "@/types";

export const FICHEIRO_DEMO = "atividades-P07.csv";

type EstadoAuditor =
  | { estado: "vazio" }
  | { estado: "a-ler"; ficheiro: string }
  | { estado: "pronto"; vista: VistaAuditoria }
  | { estado: "erro"; ficheiro: string; erro: string };

/** O protótipo do auditor: lê um CSV, audita-o e prepara o email ao parceiro. */
export function useAuditor(projetos: Projeto[]) {
  const [estado, setEstado] = useState<EstadoAuditor>({ estado: "vazio" });

  const auditarTexto = (texto: string, ficheiro: string) => {
    const leitura = lerCsv(texto);
    if (!leitura.ok) {
      setEstado({ estado: "erro", ficheiro, erro: leitura.erro });
      return;
    }
    setEstado({
      estado: "pronto",
      vista: construirAuditoria(
        auditar(leitura.linhas),
        ficheiro,
        projetoDoFicheiro(leitura.linhas, projetos),
      ),
    });
  };

  const lerFicheiro = async (ficheiro: File) => {
    if (!/\.csv$/i.test(ficheiro.name)) {
      setEstado({
        estado: "erro",
        ficheiro: ficheiro.name,
        erro: "Este ficheiro não é um CSV. Escolha um ficheiro .csv do parceiro.",
      });
      return;
    }
    setEstado({ estado: "a-ler", ficheiro: ficheiro.name });
    try {
      auditarTexto(await ficheiro.text(), ficheiro.name);
    } catch {
      setEstado({
        estado: "erro",
        ficheiro: ficheiro.name,
        erro: "Não foi possível ler o ficheiro.",
      });
    }
  };

  const experimentar = async () => {
    setEstado({ estado: "a-ler", ficheiro: FICHEIRO_DEMO });
    try {
      auditarTexto(await fetchDemo(FICHEIRO_DEMO), FICHEIRO_DEMO);
    } catch (e) {
      setEstado({
        estado: "erro",
        ficheiro: FICHEIRO_DEMO,
        erro:
          e instanceof Error ? e.message : "Não foi possível ler o ficheiro.",
      });
    }
  };

  return {
    ...estado,
    lerFicheiro,
    experimentar,
    limpar: () => setEstado({ estado: "vazio" }),
  };
}
