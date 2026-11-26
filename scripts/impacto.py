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

Arredondamentos: nunca se fazem contas com valores já arredondados. Arredonda-se uma vez, no fim de cada
conta, com ,5 para cima, só para comparar e para mostrar. Os ficheiros guardam os valores exatos; os gabaritos,
os arredondados.

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
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "public" / "data"
GABARITOS = RAIZ / "scripts" / "gabaritos.json"

# docs/PLANO-V2.md, tabela 2.3: o indicador da necessidade por área, e se a necessidade sobe com o valor
NECESSIDADE = {
    "educacao": ("SE.LPV.PRIM", True),
    "formacao": ("SL.UEM.NEET.ZS", True),
    "saude": ("SH.DYN.MORT", True),
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


def arred(x, casas=2):
    """Arredonda com ,5 para cima (como no ecrã), a partir da forma decimal mais curta do número."""
    return float(Decimal(repr(float(x))).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP))


def pt(x, casas=0):
    """Número em pt-PT, com ,5 para cima: vírgula decimal e espaço nos milhares (a partir de 10 000)."""
    q = Decimal(repr(float(x))).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    s = f"{q:,.{casas}f}".replace(",", " ").replace(".", ",")
    inteiro = s.split(",")[0].replace(" ", "")
    return s.replace(" ", "", 1) if len(inteiro) == 4 else s


def percentil(s: pd.Series, inverter=False) -> pd.Series:
    # sem arredondar: o IIS faz-se com os percentis exatos e só ele se arredonda a 2 casas
    return (-s if inverter else s).rank(pct=True) * 100


def nivel(p):
    if p is None or pd.isna(p):
        return "a acompanhar"
    p = arred(p)
    return "forte" if p >= FORTE else "a rever" if p < REVER else "a acompanhar"


COM_ARTIGO = {
    "Brasil": ("o Brasil", "é"), "Quenia": ("o Quénia", "é"), "India": ("a Índia", "é"), "Portugal": ("Portugal", "é"),
    "Ghana": ("o Gana", "é"), "Peru": ("o Peru", "é"), "Senegal": ("o Senegal", "é"), "Bangladesh": ("o Bangladesh", "é"),
    "Colombia": ("a Colômbia", "é"), "Filipinas": ("as Filipinas", "são"), "Uganda": ("o Uganda", "é"),
    "Mocambique": ("Moçambique", "é"),
}


def frase_necessidade(pais, area, posicao, com_dado):
    """«o Senegal é o 4.º país com mais necessidade em educação, entre os 10 países com dado»."""
    nome, verbo = COM_ARTIGO.get(pais, (pais, "é"))
    lugar = "o país" if posicao == 1 else f"o {posicao}.º país"
    return f"{nome} {verbo} {lugar} com mais necessidade em {AREAS[area]}, entre os {com_dado} países com dado"


def ordinal_acao(posicao, criterio):
    """«É a 3.ª das 12 ações em profundidade»; com a posição 1, «É a 1.ª das 12 ações …»."""
    return f"É a {posicao}.ª das 12 ações{' ' + criterio if criterio else ''}"


def faixa(iis):
    """As faixas do IIS (o valor já vem a 2 casas)."""
    return "60 ou mais" if iis >= 60 else "40 a 59" if iis >= 40 else "menos de 40"


def saude_geral(saude):
    """A saúde numa palavra: «a rever» com 2 ou mais lentes a rever; «forte» com 3 ou mais fortes e nenhuma a rever."""
    niveis = [l["nivel"] for l in saude.values()]
    if niveis.count("a rever") >= 2:
        return "a rever"
    if niveis.count("forte") >= 3 and "a rever" not in niveis:
        return "forte"
    return "a acompanhar"


def objetivo_bate(objetivo: str, area: str) -> bool:
    o = objetivo.lower()
    if "saude" in o or "saúde" in o:
        return area == "saude"
    if "escolar" in o:
        return area == "educacao"
    return True


QUADRANTES = {(True, True): "Reforçar", (True, False): "Repensar ou apoiar",
              (False, True): "Manter", (False, False): "Reavaliar"}
PESOS_EVIDENCIA = (25, 30, 20)  # escala, profundidade e duração do Equilibrado, sem a necessidade
LEITURA = {"Reforçar": "avançar", "Repensar ou apoiar": "pilotar", "Manter": "rever", "Reavaliar": "rever"}


def evidencia(escala, profundidade, duracao):
    """O IIS sem a necessidade, para ela não contar duas vezes no quadrante. Exato: só se arredonda para comparar."""
    w = PESOS_EVIDENCIA
    return (w[0] * escala + w[1] * profundidade + w[2] * duracao) / sum(w)


def construir_radar(m, proj, contexto, acoes):
    """public/data/radar.json: 12 países × 6 áreas (docs/PLANO-V2.md, secções 3 e 6)."""
    ev = {pid: evidencia(m.at[pid, "escala"], m.at[pid, "profundidade"], m.at[pid, "duracao"]) for pid in m.index}
    # a mediana e as médias fazem-se com as evidências exatas; arredonda-se uma vez, para comparar
    mediana = arred(pd.Series(ev).median(), 2)
    celulas = []
    for area in AREAS:
        codigo, sobe = NECESSIDADE[area]
        valores = pd.Series({c: v["indicadores"][codigo]["valor"] for c, v in contexto.items()}, dtype="float")
        pcts = percentil(valores.dropna(), inverter=not sobe)
        da_area = list(proj.index[proj["area"] == area])
        for pais in contexto:
            aqui = [pid for pid in da_area if proj.at[pid, "pais"] == pais]
            if aqui:
                e, estimado, n = ev[aqui[0]], False, 1
            else:
                e, estimado, n = sum(ev[x] for x in da_area) / len(da_area), True, len(da_area)
            nec = float(pcts[pais]) if pais in pcts.index else None
            q = None if nec is None else QUADRANTES[(arred(nec) > 50, arred(e) > mediana)]
            celulas.append({"pais": pais, "area": area, "necessidadePercentil": nec, "evidencia": e,
                            "estimado": estimado, "n": n, "quadrante": q})

    # o custo por beneficiário de cada área, sem o nível de preços: a mediana das ações da área
    custo_area = {}
    for area in AREAS:
        da_area = proj.index[proj["area"] == area]
        custo_area[area] = float((m.loc[da_area, "custoPorPessoa"] / m.loc[da_area, "nivelPrecos"]).median())

    confianca = {a["projeto"]: a["confianca"] for a in acoes}

    def novo(pais, area, orcamento):
        c = next(x for x in celulas if x["pais"] == pais and x["area"] == area)
        aqui = next((pid for pid in proj.index if proj.at[pid, "pais"] == pais and proj.at[pid, "area"] == area), None)
        if aqui is not None and not c["estimado"]:
            # com ação na célula, o custo é o dessa ação, sem ajuste de preços
            custo = float(m.at[aqui, "custoPorPessoa"])
        else:
            custo = custo_area[area] * contexto[pais]["indicadores"][NIVEL_PRECOS]["valor"]
        leitura = "confirmar a necessidade" if c["quadrante"] is None else LEITURA[c["quadrante"]]
        if leitura == "avançar":
            # o limite: nas estimadas, uma só ação por trás; nas diretas, a confiança da ação
            if (c["estimado"] and c["n"] == 1) or (not c["estimado"] and confianca[aqui] == "baixa"):
                leitura = "pilotar"
        return {"custoPorBeneficiario": r2(custo), "alcance": r2(orcamento / custo),
                "quadrante": c["quadrante"], "leitura": leitura}

    exemplos = [("Senegal", "educacao", 100000), ("Ghana", "educacao", 100000), ("Uganda", "formacao", 250000),
                ("India", "comunicacao", 50000), ("Portugal", "tecnologia", 80000), ("Mocambique", "logistica", 120000)]
    G_radar = {
        "medianaEvidencia": mediana,
        "evidencia": {pid: arred(v) for pid, v in ev.items()},
        "celulas": {f"{c['pais']}|{c['area']}": c["quadrante"] for c in celulas},
        "custoArea": {a: r2(v) for a, v in custo_area.items()},
        "novoProjeto": {f"{p}|{a}|{o}": novo(p, a, o) for p, a, o in exemplos},
    }
    return celulas, G_radar


def main() -> int:
    meses = pd.DataFrame(json.loads((DADOS / "mensal.json").read_text(encoding="utf-8")))
    projetos = json.loads((DADOS / "projetos.json").read_text(encoding="utf-8"))
    contexto = {c["pais"]: c for c in json.loads((DADOS / "contexto.json").read_text(encoding="utf-8"))}
    desp = pd.DataFrame(json.loads((RAIZ / "data/raw/json/despesas_projeto.json").read_text(encoding="utf-8")))
    # os tipos de atividade de cada ação (sem duplicados e sem espaços a mais, como no agregar.py)
    ativ = pd.DataFrame(json.loads((RAIZ / "data/raw/json/atividades_projeto.json").read_text(encoding="utf-8")))
    ativ = ativ.drop_duplicates()
    ativ["tipo"] = ativ["tipo_atividade"].astype(str).str.strip()
    # a data de cada atividade, nos dois formatos dos dados (AAAA-MM-DD e DD/MM/AAAA)
    ativ["dt"] = pd.to_datetime(ativ["data"].astype(str).str.strip(), format="ISO8601", errors="coerce").fillna(
        pd.to_datetime(ativ["data"].astype(str).str.strip(), format="%d/%m/%Y", errors="coerce"))
    proj = pd.DataFrame(
        [{"id": p["id"], "nome": p["nome"], "pais": p["pais"], "area": p["area"], "objetivos": p["objetivos"],
          "historico": p["parceiro"]["historico"], "capacidade": p["parceiro"]["capacidade"]} for p in projetos]
    ).set_index("id")

    comp = meses[~meses["fimDeAno"]]
    g = comp.groupby("projeto")
    soma = g[["beneficiarios", "despesa", "atividades", "participantes", "jovensFormados", "horasFormacao",
              "horasVoluntariado", "horasAtividade"]].sum()
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
        # a posição do país entre os que têm o indicador: 1 = o que tem mais necessidade
        posicoes = valores.dropna().rank(ascending=not sobe, method="min")
        ind = contexto[p["pais"]]["indicadores"][codigo]
        tem = ind["valor"] is not None
        nec.append({"indicador": codigo, "valor": ind["valor"], "ano": ind["ano"],
                    "percentil": float(pcts.get(p["pais"])) if tem else None,
                    "posicao": int(posicoes[p["pais"]]) if tem else None,
                    "paisesComDado": int(valores.notna().sum())})
    m["necessidade"] = [n["percentil"] for n in nec]

    m["escala"] = percentil(m["beneficiariosPorMes"])
    # os jovens formados e os beneficiários contam populações diferentes (139 por 100, em média):
    # ficam fora do índice, como um resultado à parte
    m["profundidade"] = (percentil(m["taxaConclusao"]) + percentil(m["horasFormacaoPorBenef"])) / 2
    m["duracao"] = percentil(m["crescimento"])
    m["custoInvertido"] = percentil(m["custoPorPessoa"], inverter=True)
    m["eficienciaAjustada"] = percentil(m["custoPessoaAjustado"], inverter=True)
    # as posições entre as 12 ações (1 = a melhor), para as frases: «percentil» só aparece em Como medimos
    pos_prof = m["profundidade"].rank(ascending=False, method="min").astype(int)
    pos_dur = m["duracao"].rank(ascending=False, method="min").astype(int)
    pos_barata = m["custoPessoaAjustado"].rank(ascending=True, method="min").astype(int)

    def iis(pid, pesos):
        dims = [m.at[pid, "necessidade"], m.at[pid, "escala"], m.at[pid, "profundidade"], m.at[pid, "duracao"]]
        pares = [(w, d) for w, d in zip(pesos, dims) if d is not None and not pd.isna(d) and w > 0]
        return arred(sum(w * d for w, d in pares) / sum(w for w, _ in pares), 2)

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
        rel = "a rever" if not objetivo_bate(p["objetivos"], p["area"]) else ("forte" if arred(n["percentil"] or 0) >= 50 else "a acompanhar")
        eficacia = (m.at[pid, "profundidade"] + m.at[pid, "duracao"]) / 2
        hist = p["historico"]
        dur = arred(m.at[pid, "duracao"])
        sust = ("forte" if hist == "longo" and dur >= 50
                else "a rever" if hist == "recente" and dur < 50 else "a acompanhar")
        nec_txt = (frase_necessidade(p["pais"], p["area"], n["posicao"], n["paisesComDado"]) + f" ({n['indicador']}, {n['ano']})"
                   if n["posicao"] is not None else f"sem dado da necessidade ({n['indicador']})")
        saude = {
            "relevancia": {"nivel": rel, "frase": ("O objetivo declarado não bate com a área; " if rel == "a rever" else "") + nec_txt[0].upper() + nec_txt[1:] + "." if rel != "a rever" else f"O objetivo declarado não bate com a área; {nec_txt}."},
            "eficacia": {"nivel": nivel(eficacia), "frase": f"{ordinal_acao(pos_prof[pid], 'em profundidade')}, e os beneficiários {'+' if m.at[pid, 'crescimento'] >= 0 else '−'}{pt(abs(m.at[pid, 'crescimento']) * 100)}% de {anos[0]} para {anos[-1]} (janeiro a outubro)."},
            "eficiencia": {"nivel": nivel(m.at[pid, "eficienciaAjustada"]), "frase": f"Cada pessoa custa {pt(m.at[pid, 'custoPorPessoa'])} €; ajustado aos preços do país, é a {pos_barata[pid]}.ª mais barata por pessoa das 12 ações."},
            "impacto": {"nivel": nivel(m.at[pid, "iis_equilibrado"]), "frase": f"IIS de {pt(m.at[pid, 'iis_equilibrado'])} em 100, com os pesos equilibrados."},
            "sustentabilidade": {"nivel": sust, "frase": f"Parceiro com histórico {hist} e índice de capacidade operacional (sem unidade nos dados) de {p['capacidade']}; em duração (o crescimento dos beneficiários), {ordinal_acao(pos_dur[pid], '').lower()}."},
        }
        acoes.append({
            "projeto": pid,
            "necessidade": n,
            "escala": {"beneficiariosPorMes": float(m.at[pid, "beneficiariosPorMes"]), "percentil": float(m.at[pid, "escala"])},
            "profundidade": {"taxaConclusao": float(m.at[pid, "taxaConclusao"]),
                             "horasFormacaoPorBenef": float(m.at[pid, "horasFormacaoPorBenef"]), "percentil": float(m.at[pid, "profundidade"])},
            "jovensFormados": {"total": float(m.at[pid, "jovensFormados"]), "porMes": float(m.at[pid, "jovensFormadosPorMes"])},
            # o resumo da ação: o quê (os tipos de atividade, do mais frequente) e o formato (janeiro a outubro)
            "resumo": {
                "tiposAtividade": [t.replace("_", " ") for t in ativ[ativ["id_projeto"] == pid]["tipo"].value_counts().index],
                "participantesPorAtividade": float(soma.at[pid, "participantes"] / soma.at[pid, "atividades"]),
                "horasPorAtividade": float(soma.at[pid, "horasAtividade"] / soma.at[pid, "atividades"]),
            },
            # requisito 2: a relação entre despesa, horas de voluntariado e beneficiários, de janeiro a outubro
            "recursos": {
                "despesa": float(soma.at[pid, "despesa"]),
                "horasVoluntariado": float(soma.at[pid, "horasVoluntariado"]),
                "beneficiarios": float(soma.at[pid, "beneficiarios"]),
                "custoPorBeneficiario": float(soma.at[pid, "despesa"] / soma.at[pid, "beneficiarios"]),
                "horasPorBeneficiario": float(soma.at[pid, "horasVoluntariado"] / soma.at[pid, "beneficiarios"]),
            },
            "duracao": {"crescimento": float(m.at[pid, "crescimento"]), "percentil": float(m.at[pid, "duracao"])},
            "custoPorPessoa": {"valor": float(m.at[pid, "custoPorPessoa"]), "percentilInvertido": float(m.at[pid, "custoInvertido"])},
            "confianca": confianca,
            "pontos": pontos,
            "saude": saude,
        })

    (DADOS / "impacto.json").write_text(json.dumps(acoes, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    radar, G_radar = construir_radar(m, proj, contexto, acoes)
    (DADOS / "radar.json").write_text(json.dumps(radar, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    G = json.loads(GABARITOS.read_text(encoding="utf-8"))
    G["radar"] = G_radar
    G["impacto"] = {
        "iis": {nome: {pid: m.at[pid, f"iis_{nome}"] for pid in m.index} for nome in PREDEFINICOES},
        "faixa": {pid: faixa(m.at[pid, "iis_equilibrado"]) for pid in m.index},
        "recursos": {a["projeto"]: {k: r2(v) for k, v in a["recursos"].items()} for a in acoes},
        # o formato do resumo, por outro caminho: as atividades em bruto de janeiro a outubro (sem duplicados)
        "resumo": {
            pid: {
                "participantesPorAtividade": r2(g_["participantes"].mean()),
                "horasPorAtividade": r2(g_["horas"].mean()),
            }
            for pid, g_ in ativ[ativ["dt"].dt.month <= 10].groupby("id_projeto")
        },
        # requisitos 1 e 3: a eficiência (custo por beneficiário, do mais baixo) e o alcance (beneficiários por mês)
        "ordem": {
            "eficiencia": sorted(m.index, key=lambda pid: (arred(m.at[pid, "custoPorPessoa"]), pid)),
            "alcance": sorted(m.index, key=lambda pid: (-arred(m.at[pid, "beneficiariosPorMes"]), pid)),
        },
        # o número grande do Início: quantas pessoas por mês, e quantas em ações onde a necessidade é alta
        "alcance": {
            "beneficiariosPorMes": r2(m["beneficiariosPorMes"].sum()),
            "percentagemNecessidadeAlta": r2(
                m.loc[[arred(x) > 50 if x is not None and not pd.isna(x) else False for x in m["necessidade"]],
                      "beneficiariosPorMes"].sum() / m["beneficiariosPorMes"].sum() * 100),
        },
        "saudeGeral": {a["projeto"]: saude_geral(a["saude"]) for a in acoes},
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
