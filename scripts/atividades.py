"""Os tipos de atividade de cada ação, para o resumo do ecrã Ação.

Uso: python scripts/atividades.py   (só a biblioteca padrão)
  - lê data/raw/csv/atividades_projeto.csv (separador «;»)
      · id_projeto      liga a atividade ao projeto
      · tipo_atividade  o tipo de atividade
  - escreve public/data/atividades.json: uma linha por projeto de public/data/projetos.json,
    { "projeto": "P07", "tipos": ["apoio_estudo", "aula", "oficina_educativa"] }

Regras:
  - As linhas repetidas (iguais em todas as colunas) contam uma vez, como no agregar.py.
  - Os nomes ficam como no CSV, sem os espaços das pontas (« producao_material» → «producao_material»,
    docs/ANOMALIAS.md).
  - Os tipos vêm do mais frequente para o menos frequente; num empate, por ordem alfabética.
  - Um projeto sem atividades fica com a lista vazia (o ecrã mostra «Sem dado»).
"""

import csv
import json
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CSV = RAIZ / "data" / "raw" / "csv" / "atividades_projeto.csv"
PROJETOS = RAIZ / "public" / "data" / "projetos.json"
SAIDA = RAIZ / "public" / "data" / "atividades.json"


def main() -> int:
    with CSV.open(encoding="utf-8-sig", newline="") as f:
        linhas = list(csv.DictReader(f, delimiter=";"))
    unicas = list({tuple(l.values()): l for l in linhas}.values())

    contagem: dict[str, Counter] = {}
    for l in unicas:
        tipo = l["tipo_atividade"].strip()
        if tipo:
            contagem.setdefault(l["id_projeto"].strip(), Counter())[tipo] += 1

    projetos = [p["id"] for p in json.loads(PROJETOS.read_text(encoding="utf-8"))]
    saida = [
        {
            "projeto": p,
            "tipos": [t for t, _ in sorted(contagem.get(p, Counter()).items(), key=lambda x: (-x[1], x[0]))],
        }
        for p in projetos
    ]
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    todos = sorted({t for c in contagem.values() for t in c})
    print(f"{len(linhas)} linhas, {len(linhas) - len(unicas)} repetidas, {len(unicas)} únicas")
    print(f"{len(todos)} tipos distintos no conjunto dos dados")
    for s in saida:
        print(f"  {s['projeto']}: {len(s['tipos'])} tipos — {', '.join(s['tipos'])}")
    fora = sorted(set(contagem) - set(projetos))
    if fora:
        print(f"Projetos no CSV que não estão em projetos.json (ficam de fora): {', '.join(fora)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
