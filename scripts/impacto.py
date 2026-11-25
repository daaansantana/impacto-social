"""O Índice de Impacto Social (IIS) da Lupa, por ação (docs/PLANO-V2.md, secção 2).

Uso: .venv/bin/python scripts/impacto.py   (depois do agregar.py, que reescreve o gabaritos.json)
  - lê public/data/mensal.json, projetos.json e contexto.json, e data/raw/json/despesas_projeto.json
    (só para contar as correções de despesa de cada ação)
  - escreve public/data/impacto.json (tipo ImpactoAcao, secção 6)
  - acrescenta a scripts/gabaritos.json a chave «impacto»: o IIS das 12 ações nas 4 predefinições
    e o ranking de cada uma (as outras chaves não mudam)
  - imprime as distribuições (skill data-analysis) e a tabela das 12 ações

Pontos de atenção próprios de cada ação (contam para a confiança: alta = 0, média = 1, baixa = 2 ou mais):
  - o custo por atividade passa 2 vezes a mediana das outras ações da área, ajustado aos preços;
  - o objetivo declarado não bate com a área;
  - as correções de despesa passam 1,5 vezes a mediana das 12 ações.
O pico de fim de ano e o dia 27 são comuns a todas: ficam em Como medimos e não contam.

Regras que o plano não fixa e que ficam escritas aqui:
  - Percentil: a posição entre os 12 (pandas rank pct, empates pela média), de 0 a 100.
  - Custo por atividade: compara-se com a mediana das outras ações da mesma área, com os dois custos
    divididos pelo nível de preços do país (PA.NUS.PPPC.RF). Uma ação sozinha na área não se compara.
  - Objetivo e área: um objetivo de saúde só bate com a área saúde; um de conclusão escolar só com
    educação. Os de competências, formação ou inserção laboral batem com qualquer área.
  - Saúde da ação: «forte» a partir de 60, «a rever» abaixo de 40, «a acompanhar» no meio, em
    percentis. A sustentabilidade junta o histórico do parceiro e a duração.
"""

import json
import sys
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "public" / "data"
GABARITOS = RAIZ / "scripts" / "gabaritos.json"

# docs/PLANO-V2.md, tabela 2.3: o indicador da necessidade por área, e se a necessidade sobe com o valor
NECESSIDADE = {
    "educacao": ("SE.LPV.PRIM", True),
    "formacao": ("SL.UEM.NEET.ZS", True),
    "saude": ("SH.UHC.SRVS.CV.XD", False),
    "tecnologia": ("IT.NET.USER.ZS", False),
    "comunicacao": ("IT.NET.USER.ZS", False),
    "logistica": ("SI.POV.DDAY", True),
}
NIVEL_PRECOS = "PA.NUS.PPPC.RF"

# docs/PLANO-V2.md, tabela 2.1: pesos (necessidade, escala, profundidade, duração)
PREDEFINICOES = {
    "equilibrado": (25, 25, 30, 20),
    "chegarAMaisPessoas": (15, 50, 20, 15),
    "mudarMaisCadaVida": (20, 10, 55, 15),
    "ondeEMaisPreciso": (50, 15, 20, 15),
}

AREAS = {
    "educacao": "educação",
    "formacao": "formação",
    "saude": "saúde",
    "tecnologia": "tecnologia",
    "logistica": "logística",
    "comunicacao": "comunicação",
}
FORTE, REVER = 60, 40
LIMITE_CUSTO_ATIVIDADE = 2  # vezes a mediana das outras ações da área
LIMITE_CORRECOES = 1.5  # vezes a mediana das 12 ações


def r2(x):
    return None if x is None or pd.isna(x) else round(float(x), 2)


def pt(x, casas=0):
    """Número em pt-PT: vírgula decimal e espaço nos milhares (a partir de 10 000)."""
    s = f"{x:,.{casas}f}".replace(",", " ").replace(".", ",")
    inteiro = s.split(",")[0].replace(" ", "")
    return s.replace(" ", "", 1) if len(inteiro) == 4 else s


def percentil(s: pd.Series, inverter=False) -> pd.Series:
    return ((-s if inverter else s).rank(pct=True) * 100).round(2)


def nivel(p):
    if p is None or pd.isna(p):
        return "a acompanhar"
    return "forte" if p >= FORTE else "a rever" if p < REVER else "a acompanhar"


def objetivo_bate(objetivo: str, area: str) -> bool:
    o = objetivo.lower()
    if "saude" in o or "saúde" in o:
        return area == "saude"
    if "escolar" in o:
        return area == "educacao"
    return True


def main() -> int:
    meses = pd.DataFrame(json.loads((DADOS / "mensal.json").read_text(encoding="utf-8")))
    projetos = json.loads((DADOS / "projetos.json").read_text(encoding="utf-8"))
    contexto = {c["pais"]: c for c in json.loads((DADOS / "contexto.json").read_text(encoding="utf-8"))}
    desp = pd.DataFrame(json.loads((RAIZ / "data/raw/json/despesas_projeto.json").read_text(encoding="utf-8")))
    proj = pd.DataFrame(
        [{"id": p["id"], "nome": p["nome"], "pais": p["pais"], "area": p["area"], "objetivos": p["objetivos"],
          "historico": p["parceiro"]["historico"], "capacidade": p["parceiro"]["capacidade"]} for p in projetos]
    ).set_index("id")

    comp = meses[~meses["fimDeAno"]]
    g = comp.groupby("projeto")
    soma = g[["beneficiarios", "despesa", "atividades", "participantes", "jovensFormados", "horasFormacao"]].sum()
    n_meses = g.size()
    ano = comp["mes"].str[:4]
    benef_ano = comp.groupby([comp["projeto"], ano])["beneficiarios"].sum().unstack()
    anos = sorted(benef_ano.columns)

    m = pd.DataFrame(index=proj.index)
    m["beneficiariosPorMes"] = soma["beneficiarios"] / n_meses
    m["taxaConclusao"] = g["taxaConclusao"].mean()
    m["jovensFormados"] = soma["jovensFormados"]
    m["jovensFormadosPorMes"] = soma["jovensFormados"] / n_meses
    m["horasFormacaoPorBenef"] = soma["horasFormacao"] / soma["beneficiarios"]
    m["crescimento"] = benef_ano[anos[-1]] / benef_ano[anos[0]] - 1
    m["custoPorPessoa"] = soma["despesa"] / soma["beneficiarios"]
    m["custoPorAtividade"] = soma["despesa"] / soma["atividades"]
    m["participantesPorAtividade"] = soma["participantes"] / soma["atividades"]
    m["nivelPrecos"] = [contexto[p]["indicadores"][NIVEL_PRECOS]["valor"] for p in proj["pais"]]
    m["custoAtividadeAjustado"] = m["custoPorAtividade"] / m["nivelPrecos"]
    m["custoPessoaAjustado"] = m["custoPorPessoa"] / m["nivelPrecos"]

    # necessidade: o indicador da área, no país do projeto, em percentil entre os 12 países
    nec = []
    for pid, p in proj.iterrows():
        codigo, sobe = NECESSIDADE[p["area"]]
        valores = pd.Series({c: v["indicadores"][codigo]["valor"] for c, v in contexto.items()}, dtype="float")
        pcts = percentil(valores.dropna(), inverter=not sobe)
        ind = contexto[p["pais"]]["indicadores"][codigo]
        nec.append({"indicador": codigo, "valor": ind["valor"], "ano": ind["ano"],
                    "percentil": r2(pcts.get(p["pais"])) if ind["valor"] is not None else None})
    m["necessidade"] = [n["percentil"] for n in nec]

    m["escala"] = percentil(m["beneficiariosPorMes"])
    # os jovens formados e os beneficiários contam populações diferentes (139 por 100, em média):
    # ficam fora do índice, como um resultado à parte
    m["profundidade"] = ((percentil(m["taxaConclusao"]) + percentil(m["horasFormacaoPorBenef"])) / 2).round(2)
    m["duracao"] = percentil(m["crescimento"])
    m["custoInvertido"] = percentil(m["custoPorPessoa"], inverter=True)
    m["eficienciaAjustada"] = percentil(m["custoPessoaAjustado"], inverter=True)

    def iis(pid, pesos):
        dims = [m.at[pid, "necessidade"], m.at[pid, "escala"], m.at[pid, "profundidade"], m.at[pid, "duracao"]]
        pares = [(w, d) for w, d in zip(pesos, dims) if d is not None and not pd.isna(d) and w > 0]
        return sum(w * d for w, d in pares) / sum(w for w, _ in pares)

    for nome, pesos in PREDEFINICOES.items():
        m[f"iis_{nome}"] = [iis(pid, pesos) for pid in m.index]

    # pontos de atenção próprios de cada ação (tabela 2.4)
    # o pico de fim de ano é comum a todas as ações: fica em Como medimos e não conta aqui
    correcoes = desp[desp["valor"] < 0].groupby("id_projeto").size().reindex(proj.index, fill_value=0)
    med_correcoes = correcoes.median()

    acoes, pontos_conta = [], {}
    for pid, p in proj.iterrows():
        pontos = []
        # compara com as outras ações da mesma área (a mediana delas), com os custos ajustados aos preços
        outros = [o for o in proj.index[proj["area"] == p["area"]] if o != pid]
        razao = m.at[pid, "custoAtividadeAjustado"] / m.loc[outros, "custoAtividadeAjustado"].median() if outros else 0
        if razao > LIMITE_CUSTO_ATIVIDADE:
            meu = round(m.at[pid, "participantesPorAtividade"])
            deles = round(m.loc[outros, "participantesPorAtividade"].median())
            part = (f"com o mesmo número de participantes por atividade ({meu})" if meu == deles
                    else f"com {meu} participantes por atividade, contra {deles}")
            quem = f"na outra ação de {AREAS[p['area']]} ({outros[0]})" if len(outros) == 1 else f"nas outras ações de {AREAS[p['area']]} ({' e '.join(outros)})"
            pontos.append({"id": "custoAtividade", "texto": f"Cada atividade custa {pt(razao, 1)} vezes mais do que {quem}, {part}. A diferença de preços entre os países não chega para o explicar. Pedir o detalhe das maiores despesas."})
        if not objetivo_bate(p["objetivos"], p["area"]):
            pontos.append({"id": "objetivoArea", "texto": f"O objetivo declarado é «{p['objetivos']}», mas a área é {AREAS[p['area']]}. Confirmar qual vale para medir o impacto."})
        if correcoes[pid] > LIMITE_CORRECOES * med_correcoes:
            pontos.append({"id": "correcoes", "texto": f"Há {pt(correcoes[pid])} correções de despesa sem referência à despesa original. Pedir a referência."})
        pontos_conta[pid] = len(pontos)
        confianca = "alta" if not pontos else "média" if len(pontos) == 1 else "baixa"

        n = nec[list(proj.index).index(pid)]
        rel = "a rever" if not objetivo_bate(p["objetivos"], p["area"]) else ("forte" if (n["percentil"] or 0) >= 50 else "a acompanhar")
        eficacia = (m.at[pid, "profundidade"] + m.at[pid, "duracao"]) / 2
        hist = p["historico"]
        sust = ("forte" if hist == "longo" and m.at[pid, "duracao"] >= 50
                else "a rever" if hist == "recente" and m.at[pid, "duracao"] < 50 else "a acompanhar")
        nec_txt = (f"a necessidade no país está no percentil {pt(n['percentil'])} ({n['indicador']}, {n['ano']})"
                   if n["percentil"] is not None else f"sem dado da necessidade ({n['indicador']})")
        saude = {
            "relevancia": {"nivel": rel, "frase": ("O objetivo declarado não bate com a área; " if rel == "a rever" else "") + nec_txt[0].upper() + nec_txt[1:] + "." if rel != "a rever" else f"O objetivo declarado não bate com a área; {nec_txt}."},
            "eficacia": {"nivel": nivel(eficacia), "frase": f"Profundidade no percentil {pt(m.at[pid, 'profundidade'])} e beneficiários {'+' if m.at[pid, 'crescimento'] >= 0 else '−'}{pt(abs(m.at[pid, 'crescimento']) * 100)}% de {anos[0]} para {anos[-1]} (janeiro a outubro)."},
            "eficiencia": {"nivel": nivel(m.at[pid, "eficienciaAjustada"]), "frase": f"Cada pessoa custa {pt(m.at[pid, 'custoPorPessoa'])} €; ajustado aos preços do país, fica no percentil {pt(m.at[pid, 'eficienciaAjustada'])} das 12 ações (mais alto é mais barato)."},
            "impacto": {"nivel": nivel(m.at[pid, "iis_equilibrado"]), "frase": f"IIS de {pt(m.at[pid, 'iis_equilibrado'])} em 100, com os pesos equilibrados."},
            "sustentabilidade": {"nivel": sust, "frase": f"Parceiro com histórico {hist} e índice de capacidade operacional (sem unidade nos dados) de {p['capacidade']}; duração no percentil {pt(m.at[pid, 'duracao'])}."},
        }
        acoes.append({
            "projeto": pid,
            "necessidade": n,
            "escala": {"beneficiariosPorMes": r2(m.at[pid, "beneficiariosPorMes"]), "percentil": r2(m.at[pid, "escala"])},
            "profundidade": {"taxaConclusao": r2(m.at[pid, "taxaConclusao"]),
                             "horasFormacaoPorBenef": r2(m.at[pid, "horasFormacaoPorBenef"]), "percentil": r2(m.at[pid, "profundidade"])},
            "jovensFormados": {"total": r2(m.at[pid, "jovensFormados"]), "porMes": r2(m.at[pid, "jovensFormadosPorMes"])},
            "duracao": {"crescimento": round(float(m.at[pid, "crescimento"]), 4), "percentil": r2(m.at[pid, "duracao"])},
            "custoPorPessoa": {"valor": r2(m.at[pid, "custoPorPessoa"]), "percentilInvertido": r2(m.at[pid, "custoInvertido"])},
            "confianca": confianca,
            "pontos": pontos,
            "saude": saude,
        })

    (DADOS / "impacto.json").write_text(json.dumps(acoes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    G = json.loads(GABARITOS.read_text(encoding="utf-8"))
    G["impacto"] = {
        "iis": {nome: {pid: r2(m.at[pid, f"iis_{nome}"]) for pid in m.index} for nome in PREDEFINICOES},
        "ranking": {nome: sorted(m.index, key=lambda pid: (-m.at[pid, f"iis_{nome}"], pid)) for nome in PREDEFINICOES},
    }
    GABARITOS.write_text(json.dumps(G, ensure_ascii=False, indent=1), encoding="utf-8")

    # distribuições (skill data-analysis): resumo e valores fora de 1,5 × IQR
    cols = ["beneficiariosPorMes", "taxaConclusao", "jovensFormadosPorMes", "horasFormacaoPorBenef", "crescimento",
            "custoPorPessoa", "custoAtividadeAjustado", "necessidade", "escala", "profundidade", "duracao", "iis_equilibrado"]
    print(m[cols].astype(float).describe().round(2).T.to_string())
    print("\nFora de 1,5 × IQR:")
    for c in cols[:7]:
        s = m[c].astype(float)
        q1, q3 = s.quantile(0.25), s.quantile(0.75)
        fora = s[(s < q1 - 1.5 * (q3 - q1)) | (s > q3 + 1.5 * (q3 - q1))]
        if len(fora):
            print(f"  {c}: " + ", ".join(f"{k} {v:.2f}" for k, v in fora.items()))
    print("\nAção | País | Área | IIS equilibrado | Necessidade | Escala | Profundidade | Duração | Custo/pessoa | Confiança | Pontos")
    for pid in sorted(m.index, key=lambda pid: -m.at[pid, "iis_equilibrado"]):
        a = next(x for x in acoes if x["projeto"] == pid)
        print(f"{pid} | {proj.at[pid, 'pais']} | {proj.at[pid, 'area']} | {m.at[pid, 'iis_equilibrado']:.1f} | "
              f"{m.at[pid, 'necessidade'] if m.at[pid, 'necessidade'] is not None else '—'} | {m.at[pid, 'escala']:.1f} | "
              f"{m.at[pid, 'profundidade']:.1f} | {m.at[pid, 'duracao']:.1f} | {m.at[pid, 'custoPorPessoa']:.0f} | "
              f"{a['confianca']} | {', '.join(x['id'] for x in a['pontos']) or '—'}")
    print("\nRankings:", {k: v[:4] for k, v in G["impacto"]["ranking"].items()})
    return 0


if __name__ == "__main__":
    sys.exit(main())
