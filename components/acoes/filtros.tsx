"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Opcao } from "@/lib/vista-acoes";

export type CampoFiltro = "regiao" | "pais" | "area" | "saude" | "confianca";

const CAMPOS: { chave: CampoFiltro; rotulo: string; todos: string }[] = [
  { chave: "regiao", rotulo: "Região", todos: "Todas as regiões" },
  { chave: "pais", rotulo: "País", todos: "Todos os países" },
  { chave: "area", rotulo: "Área", todos: "Todas as áreas" },
  { chave: "saude", rotulo: "Saúde da ação", todos: "Qualquer saúde" },
  { chave: "confianca", rotulo: "Confiança", todos: "Qualquer confiança" },
];

/** Os filtros da lista de Ações; o mesmo bloco serve a coluna lateral e a folha do telemóvel. */
export function FiltrosAcoes({
  id,
  opcoes,
  valores,
  onMudar,
  onLimpar,
}: {
  /** prefixo dos ids, para haver dois blocos na página */
  id: string;
  opcoes: Record<CampoFiltro, Opcao[]>;
  valores: Partial<Record<CampoFiltro, string>>;
  onMudar: (campo: CampoFiltro, valor: string) => void;
  onLimpar: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Filtros"
    >
      {CAMPOS.map((c) => (
        <div key={c.chave} className="flex flex-col gap-1.5">
          <Label htmlFor={`${id}-${c.chave}`}>{c.rotulo}</Label>
          <NativeSelect
            id={`${id}-${c.chave}`}
            className="w-full [&_select]:h-11 [&_select]:text-base"
            value={valores[c.chave] ?? ""}
            onChange={(e) => onMudar(c.chave, e.target.value)}
          >
            <option value="">{c.todos}</option>
            {opcoes[c.chave].map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </NativeSelect>
        </div>
      ))}
      <Button type="button" variant="outline" size="lg" onClick={onLimpar}>
        Limpar filtros
      </Button>
    </form>
  );
}
