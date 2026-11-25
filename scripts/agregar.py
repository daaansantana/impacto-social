#!/usr/bin/env python3
"""Gera os dados resumidos da app, os ficheiros de demonstracao do auditor e os gabaritos.

Uso: python3 scripts/agregar.py data/raw/json data/raw/csv .
Escreve:
  public/data/projetos.json, mensal.json, planos.json, qualidade.json
  public/demo/atividades-P07.csv, despesas-P07.csv
  scripts/gabaritos.json
Regras de limpeza: docs/SPEC.md. Os gabaritos sao calculados a partir dos dados em bruto,
por um caminho diferente do da app (que so le os ficheiros resumidos).
"""
import csv
import io
import json
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd

RAW = Path(sys.argv[1])
RAW_CSV = Path(sys.argv[2])
OUT = Path(sys.argv[3])
(OUT / "public" / "data").mkdir(parents=True, exist_ok=True)
(OUT / "public" / "demo").mkdir(parents=True, exist_ok=True)
(OUT / "scripts").mkdir(parents=True, exist_ok=True)

FIM_DE_ANO = (11, 12)


def load(n):
    with open(RAW / f"{n}.json", encoding="utf-8") as f:
        return pd.DataFrame(json.load(f))


def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s.strip().lower())


def pdate(s):
    if s is None or (isinstance(s, float) and np.isnan(s)):
        return pd.NaT
    s = str(s).strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return pd.Timestamp(s)
    if re.match(r"^\d{2}/\d{2}/\d{4}$", s):
        return pd.to_datetime(s, format="%d/%m/%Y")
    if re.match(r"^\d{4}-\d{2}$", s):
        return pd.to_datetime(s, format="%Y-%m")
    return pd.NaT


def r2(x):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), 2)


proj = load("projetos")
parc = load("parceiros_locais")
vol = load("voluntarios")
skills = load("voluntarios_skills")
aloc = load("alocacoes_voluntarios")
ativ_raw = load("atividades_projeto")
coord = load("coordenacao_eventos")
desp = load("despesas_projeto")
met = load("metricas_impacto")
planos = load("planos_investimento")
P = proj["id"].tolist()
MESES = [str(m) for m in pd.period_range("2024-01", "2025-12", freq="M")]

# ---------------- limpeza ----------------
desp["dt"] = desp["data"].map(pdate)
ativ = ativ_raw.drop_duplicates().copy()
ativ["dt"] = ativ["data"].map(pdate)
ativ["tipo_atividade"] = ativ["tipo_atividade"].str.strip()
coord["dt"] = coord["data"].map(pdate)
met["dt"] = met["periodo"].map(pdate)
met["unidade"] = met["unidade"].map(norm).replace({"beneficiario": "beneficiarios", "beneficiaries": "beneficiarios"})
REF = max(desp["dt"].max(), ativ["dt"].max(), coord["dt"].max())
aloc_ok = aloc[aloc["id_projeto"].isin(P)].copy()
aloc_ok["di"] = aloc_ok["data_inicio"].map(pdate)
aloc_ok["df"] = aloc_ok["data_fim"].map(pdate).fillna(REF)

for df in (desp, ativ, coord, met):
    df["mes"] = df["dt"].dt.to_period("M").astype(str)
    df["fda"] = df["dt"].dt.month.isin(FIM_DE_ANO)

# horas de voluntariado repartidas pelos dias de cada alocacao
dias = ((aloc_ok["df"] - aloc_ok["di"]).dt.days + 1).to_numpy()
rep = np.repeat(np.arange(len(aloc_ok)), dias)
offs = np.concatenate([np.arange(n) for n in dias])
day = aloc_ok["di"].to_numpy()[rep] + offs.astype("timedelta64[D]")
hv = pd.DataFrame({
    "projeto": aloc_ok["id_projeto"].to_numpy()[rep],
    "mes": pd.to_datetime(day).to_period("M").astype(str),
    "h": (aloc_ok["horas_realizadas"] / dias).to_numpy()[rep],
    "v": aloc_ok["id_voluntario"].to_numpy()[rep],
})
hv = hv[hv["mes"].isin(MESES)]

# ---------------- mensal.json ----------------
idx = pd.MultiIndex.from_product([P, MESES], names=["projeto", "mes"])
m = pd.DataFrame(index=idx)
m["despesa"] = desp.groupby(["id_projeto", "mes"])["valor"].sum()
m["estornos"] = -desp[desp["valor"] < 0].groupby(["id_projeto", "mes"])["valor"].sum()
m["atividades"] = ativ.groupby(["id_projeto", "mes"]).size()
m["participantes"] = ativ.groupby(["id_projeto", "mes"])["participantes"].sum()
m["horasAtividade"] = ativ.groupby(["id_projeto", "mes"])["horas"].sum()
m["horasVoluntariado"] = hv.groupby(["projeto", "mes"])["h"].sum()
m["voluntariosRegistados"] = hv.groupby(["projeto", "mes"])["v"].nunique()
mp = met.pivot_table(index=["id_projeto", "mes"], columns="metrica", values="valor", aggfunc="sum")
names = {"beneficiarios": "beneficiarios", "jovens_formados": "jovensFormados", "horas_formacao": "horasFormacao",
         "oficinas_realizadas": "oficinas", "taxa_conclusao": "taxaConclusao",
         "voluntarios_ativos": "voluntariosReportados"}
for k, v in names.items():
    m[v] = mp[k]
m["reunioes"] = coord.groupby(["id_projeto", "mes"]).size()
m["horasReuniao"] = coord.groupby(["id_projeto", "mes"])["horas_reuniao"].sum()
m = m.fillna(0)
mensal = []
for (pid, mes), row in m.iterrows():
    d = {"projeto": pid, "mes": mes, "fimDeAno": int(mes[5:]) in FIM_DE_ANO}
    for c in m.columns:
        v = row[c]
        if c in ("atividades", "participantes", "voluntariosRegistados", "reunioes"):
            d[c] = int(v)
        elif c == "horasVoluntariado":
            d[c] = round(float(v), 6)  # repartidas por dia: sem arredondar a 2 casas, para os totais baterem
        else:
            d[c] = r2(v)
    mensal.append(d)
json.dump(mensal, open(OUT / "public/data/mensal.json", "w", encoding="utf-8"), ensure_ascii=False)

# ---------------- projetos.json ----------------
sk = skills.groupby("id_voluntario")["skill"].apply(set)
am = aloc_ok.merge(proj[["id", "area_foco"]], left_on="id_projeto", right_on="id")
am["match"] = [a in sk.get(v, set()) for v, a in zip(am["id_voluntario"], am["area_foco"])]
match = am.groupby("id_projeto")["match"].mean()
ok_est = ["aprovado", "em_execucao", "concluido"]
pl = parc.set_index("id")
projetos = []
for r in proj.itertuples():
    pp = planos[planos["id_projeto"] == r.id]
    projetos.append({
        "id": r.id, "nome": r.nome, "pais": r.pais, "regiao": r.regiao, "area": r.area_foco,
        "anoInicio": int(r.ano_inicio), "orcamentoAnual": r2(r.orcamento_anual), "estado": r.estado,
        "objetivos": r.objetivos,
        "parceiro": {"id": r.parceiro_local_id, "especialidade": pl.loc[r.parceiro_local_id, "especialidade"],
                     "historico": pl.loc[r.parceiro_local_id, "historico_colaboracao"],
                     "capacidade": int(pl.loc[r.parceiro_local_id, "capacidade_operacional"])},
        "voluntariosDistintos": int(aloc_ok[aloc_ok["id_projeto"] == r.id]["id_voluntario"].nunique()),
        "competenciaCerta": r2(match.get(r.id, np.nan) * 100),
        "investimentoAprovado": r2(pp[pp["estado"].isin(ok_est)]["valor_previsto"].sum()),
        "investimentoProposto": r2(pp[pp["estado"] == "proposto"]["valor_previsto"].sum()),
    })
json.dump(projetos, open(OUT / "public/data/projetos.json", "w", encoding="utf-8"), ensure_ascii=False)

# ---------------- planos.json ----------------
planos_out = [{"id": r.id, "projeto": r.id_projeto, "data": str(pdate(r.data).date()), "tipo": r.tipo,
               "valor": r2(r.valor_previsto), "estado": r.estado, "descricao": r.descricao}
              for r in planos.itertuples()]
json.dump(planos_out, open(OUT / "public/data/planos.json", "w", encoding="utf-8"), ensure_ascii=False)

# ---------------- gabaritos: eficiencia (a partir do bruto) ----------------
G = {"referencia": str(REF.date())}


def eficiencia(comparaveis):
    d = desp if not comparaveis else desp[~desp["fda"]]
    b = met[met["metrica"] == "beneficiarios"]
    j = met[met["metrica"] == "jovens_formados"]
    h = hv.copy()
    if comparaveis:
        b, j = b[~b["fda"]], j[~j["fda"]]
        h = h[~h["mes"].str[5:].astype(int).isin(FIM_DE_ANO)]
    dd = d.groupby("id_projeto")["valor"].sum()
    bb = b.groupby("id_projeto")["valor"].sum()
    jj = j.groupby("id_projeto")["valor"].sum()
    hh = h.groupby("projeto")["h"].sum()
    euro = dd / bb
    hora = bb / hh * 1000
    jovem = dd / jj
    out = {}
    for nome, s, asc in [("euro", euro, True), ("hora", hora, False), ("jovem", jovem, True)]:
        rk = s.rank(ascending=asc, method="first").astype(int)
        out[nome] = {"valor": {k: r2(v) for k, v in s.items()}, "posicao": {k: int(v) for k, v in rk.items()}}
    out["totais"] = {"despesa": r2(dd.sum()), "beneficiarios": r2(bb.sum()), "horasVoluntariado": r2(hh.sum()),
                     "custoPorBeneficiario": r2(dd.sum() / bb.sum())}
    out["beneficiariosPorProjeto"] = {k: r2(v) for k, v in bb.items()}
    out["alcance"] = {"posicao": {k: int(v) for k, v in bb.rank(ascending=False, method="first").astype(int).items()}}
    out["despesaPorProjeto"] = {k: r2(v) for k, v in dd.items()}
    return out


G["eficiencia"] = {"todos": eficiencia(False), "comparaveis": eficiencia(True)}


# ---------------- gabaritos: ecra do projeto ----------------
def resumo_projeto(comparaveis):
    d = desp if not comparaveis else desp[~desp["fda"]]
    a = ativ if not comparaveis else ativ[~ativ["fda"]]
    c = coord if not comparaveis else coord[~coord["fda"]]
    res = {}
    for pid in P:
        dd, aa, cc = d[d["id_projeto"] == pid], a[a["id_projeto"] == pid], c[c["id_projeto"] == pid]
        res[pid] = {
            "custoPorAtividade": r2(dd["valor"].sum() / len(aa)),
            "reunioesPor100hAtividade": r2(cc["horas_reuniao"].sum() / aa["horas"].sum() * 100),
            "estornos": r2(-dd.loc[dd["valor"] < 0, "valor"].sum()),
        }
    return res


_bm = met[met["metrica"] == "beneficiarios"]
_sub = _bm.groupby(["id_projeto", "fda"])["valor"].mean().unstack()
G["projeto"] = {
    "todos": resumo_projeto(False),
    "comparaveis": resumo_projeto(True),
    "subidaFimDeAno": {k: r2(v) for k, v in (_sub[True] / _sub[False] - 1).items()},
}

# ---------------- gabaritos: fim de ano ----------------
def media_mensal(df, val=None):
    g = df.groupby(["mes", "fda"])
    s = (g.size() if val is None else g[val].sum()).reset_index(name="v")
    r = s.groupby("fda")["v"].mean()
    return float(r[False]), float(r[True])


a0, a1 = media_mensal(ativ)
b0, b1 = media_mensal(met[met["metrica"] == "beneficiarios"], "valor")
d0, d1 = media_mensal(desp, "valor")
G["fimDeAno"] = {
    "atividadesPorMes": {"janOut": r2(a0), "novDez": r2(a1), "subida": r2(a1 / a0 - 1)},
    "beneficiariosPorMes": {"janOut": r2(b0), "novDez": r2(b1), "subida": r2(b1 / b0 - 1)},
    "despesaPorMes": {"janOut": r2(d0), "novDez": r2(d1), "subida": r2(d1 / d0 - 1)},
    "custoPorBeneficiario": {"janOut": r2(d0 / b0), "novDez": r2(d1 / b1)},
}

# ---------------- gabaritos: simulacao e KPI ----------------
ce = G["eficiencia"]["comparaveis"]["euro"]
custo = pd.Series(ce["valor"])
ordem = custo.sort_values()
para = list(ordem.index[:4])
de = list(ordem.index[-4:])
inv = pd.Series({p["id"]: p["investimentoAprovado"] for p in projetos})
custo_medio = G["eficiencia"]["comparaveis"]["totais"]["custoPorBeneficiario"]


def simular(fracao, fator):
    movido = {k: inv[k] * fracao for k in de}
    total = sum(movido.values())
    perdidos = sum(movido[k] / custo[k] for k in de)
    ganhos = sum((total / len(para)) / (custo[k] * fator) for k in para)
    saldo = ganhos - perdidos
    return {"fracaoMovida": fracao, "fatorCustoMarginal": fator, "movido": r2(total), "perdidos": r2(perdidos),
            "ganhos": r2(ganhos), "saldo": r2(saldo), "saldoPorAno": r2(saldo / 2),
            "valorEquivalentePorAno": r2(saldo / 2 * custo_medio)}


G["simulacao"] = {
    "de": de, "para": para, "custoBase": "comparaveis (janeiro a outubro)",
    "investimentoAprovado": {k: r2(v) for k, v in inv.items()},
    "cenarios": {"prudente": simular(0.5, 1.2), "provavel": simular(1.0, 1.2), "otimista": simular(1.0, 1.0)},
    "fatorDeEquilibrio": None,
    "custoMedioComparavel": custo_medio,
}
_o = G["simulacao"]["cenarios"]["otimista"]
G["simulacao"]["fatorDeEquilibrio"] = r2(_o["ganhos"] / _o["perdidos"])

# ---------------- qualidade.json ----------------
neg = desp[desp["valor"] < 0]
ddmm = ~desp["data"].astype(str).str.match(r"^\d{4}-\d{2}-\d{2}$")
res_norm = ativ["resultado_atividade"].fillna("").map(norm)
sem_res = int(res_norm.isin(["", "sem registo"]).sum())
dias28 = sum(int((df["dt"].dt.day >= 28).sum()) for df in (ativ_raw.assign(dt=ativ_raw["data"].map(pdate)), desp, coord,
                                                            planos.assign(dt=planos["data"].map(pdate))))
n_diarios = len(ativ_raw) + len(desp) + len(coord) + len(planos)
reg = hv.groupby("mes")["v"].nunique()
rep_ = met[met["metrica"] == "voluntarios_ativos"].groupby("mes")["valor"].sum()
qualidade = {
    "referencia": str(REF.date()),
    "limpeza": [
        {"id": "datas", "titulo": "Despesas com data DD/MM/AAAA", "quantidade": int(ddmm.sum()), "de": len(desp),
         "regra": "Ler os dois formatos", "impacto": "Um leitor estrito perde 20,5% da despesa"},
        {"id": "estornos", "titulo": "Estornos (despesas negativas)", "quantidade": len(neg), "de": len(desp),
         "valor": r2(-neg["valor"].sum()), "regra": "Abater ao projeto"},
        {"id": "duplicados", "titulo": "Atividades duplicadas", "quantidade": len(ativ_raw) - len(ativ),
         "de": len(ativ_raw), "regra": "Remover"},
        {"id": "referencias", "titulo": "Alocações para o projeto P99, que não existe",
         "quantidade": int((aloc["id_projeto"] == "P99").sum()), "de": len(aloc),
         "horas": r2(aloc.loc[aloc["id_projeto"] == "P99", "horas_realizadas"].sum()), "regra": "Fora das contas"},
        {"id": "unidades", "titulo": "Unidade dos beneficiários escrita de outra forma",
         "quantidade": int((load("metricas_impacto")["unidade"] != "beneficiarios").sum()
                           - (load("metricas_impacto")["metrica"] != "beneficiarios").sum()),
         "de": int((met["metrica"] == "beneficiarios").sum()), "regra": "Normalizar"},
        {"id": "semResultado", "titulo": "Atividades sem resultado", "quantidade": sem_res, "de": len(ativ),
         "regra": "Não tirar conclusões do resultado"},
    ],
    "anomalias": [
        {"id": "fimDeAno", "titulo": "Pico de fim de ano",
         "texto": "Em novembro e dezembro, as atividades e os beneficiários sobem sem mais despesa.",
         "numeros": G["fimDeAno"]},
        {"id": "dia27", "titulo": "O mês acaba no dia 27",
         "texto": "Nenhuma atividade, despesa, reunião ou plano nos dias 28 a 31.",
         "numeros": {"registosDias28a31": dias28, "registos": n_diarios, "esperado": round(n_diarios * 83 / 731)}},
        {"id": "semana", "titulo": "Domingo igual a segunda",
         "texto": "As datas não seguem a semana de trabalho.",
         "numeros": {"aulasAoDomingo": r2((ativ[ativ["tipo_atividade"] == "aula"]["dt"].dt.dayofweek == 6).mean() * 100),
                     "despesasAoDomingo": r2((desp["dt"].dt.dayofweek == 6).mean() * 100)}},
        {"id": "voluntarios", "titulo": "Voluntários reportados contra registados",
         "texto": "Os registos caem todos os meses; o que os projetos reportam fica estável.",
         "numeros": {"registados": {k: int(reg.get(k, 0)) for k in MESES},
                     "reportados": {k: r2(rep_.get(k, 0)) for k in MESES}}},
    ],
}
vazias = int((desp["descricao_curta"].fillna("").str.strip() == "").sum())
qualidade["notaGenerica"] = {
    "ferramenta": "validate_dataset.py (skill data-analysis)",
    "resultado": "Nota A em todas as 10 tabelas (de 94,8 a 100): a validação genérica não vê nenhum dos problemas abaixo.",
}
qualidade["scorecard"] = [
    {"dimensao": "Completude", "nota": 3,
     "evidencia": f"{sem_res} de {len(ativ)} atividades sem resultado ({sem_res / len(ativ) * 100:.1f}%); "
                  f"{vazias} de {len(desp)} despesas sem descrição"},
    {"dimensao": "Consistência", "nota": 2,
     "evidencia": f"{int(ddmm.sum())} despesas com data DD/MM/AAAA; 19 unidades escritas de outra forma; "
                  "maiúsculas misturadas; « producao_material» com espaço; objetivos que não batem com a área"},
    {"dimensao": "Unicidade", "nota": 4,
     "evidencia": f"{len(ativ_raw) - len(ativ)} atividades duplicadas ({(len(ativ_raw) - len(ativ)) / len(ativ_raw) * 100:.1f}%)"},
    {"dimensao": "Atualidade", "nota": 2,
     "evidencia": f"nenhum registo depois do dia 27 ({dias28} de {n_diarios}); voluntários ativos nos registos "
                  f"caem até {int(reg.get('2025-12', 0))} em dezembro de 2025"},
    {"dimensao": "Exatidão", "nota": 2,
     "evidencia": "pico de fim de ano sem mais despesa; aulas com as escolas fechadas; domingos iguais a segundas; "
                  "uma reunião de 25,23 h num dia; voluntários reportados diferentes dos registados"},
    {"dimensao": "Integridade", "nota": 3,
     "evidencia": f"{int((aloc['id_projeto'] == 'P99').sum())} alocações ({(aloc['id_projeto'] == 'P99').mean() * 100:.1f}%) "
                  "para o projeto P99, que não existe"},
]
json.dump(qualidade, open(OUT / "public/data/qualidade.json", "w", encoding="utf-8"), ensure_ascii=False)
G["qualidade"] = {x["id"]: x["quantidade"] for x in qualidade["limpeza"]}
G["qualidade"]["dias28a31"] = dias28

# ---------------- demo do auditor e gabaritos do auditor ----------------
def read_csv_rows(path):
    txt = open(path, encoding="utf-8-sig").read()
    return list(csv.DictReader(io.StringIO(txt), delimiter=";"))


def write_csv(rows, path):
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
        w.writeheader()
        w.writerows(rows)


def num(s):
    s = str(s).strip()
    if s == "":
        return None
    try:
        return float(s.replace(".", "").replace(",", ".")) if re.match(r"^-?\d{1,3}(\.\d{3})+(,\d+)?$", s) \
            else float(s.replace(",", "."))
    except ValueError:
        return None


def auditar(rows):
    """Mesmas regras que lib/auditor.ts (docs/SPEC.md)."""
    cols = list(rows[0].keys())
    res = {"linhas": len(rows)}
    dcol = next((c for c in ("data", "data_inicio", "periodo") if c in cols), None)
    if dcol:
        fmt = {"iso": 0, "ddmm": 0, "outro": 0}
        dts = []
        for r in rows:
            s = r[dcol].strip()
            if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
                fmt["iso"] += 1
            elif re.match(r"^\d{2}/\d{2}/\d{4}$", s):
                fmt["ddmm"] += 1
            else:
                fmt["outro"] += 1
            dts.append(pdate(s))
        dts = pd.Series(dts).dropna()
        res["datas"] = fmt
        res["dias28a31"] = int((dts.dt.day >= 28).sum())
        res["diaMaximo"] = int(dts.dt.day.max())
        res["domingo"] = r2((dts.dt.dayofweek == 6).mean() * 100)
        cnt = dts.dt.to_period("M").astype(str).value_counts().sort_index()
        med = float(cnt.median())
        res["picos"] = [k for k, v in cnt.items() if v >= 1.3 * med]
    if "valor" in cols:
        vals = [num(r["valor"]) for r in rows]
        res["negativos"] = sum(1 for v in vals if v is not None and v < 0)
    if "id" in cols:
        ids = pd.Series([r["id"] for r in rows])
        res["idsRepetidos"] = int(ids.duplicated(keep=False).sum())
    keys = [tuple(r.values()) for r in rows]
    res["linhasIguais"] = len(keys) - len(set(keys))
    if "id_projeto" in cols:
        res["refsInvalidas"] = sum(1 for r in rows if r["id_projeto"] not in P)
    graf = []
    for c in cols:
        vals = set(r[c] for r in rows if r[c].strip() != "")
        if c == "id" or c.startswith("id_") or c in ("data", "valor") or len(vals) > 40:
            continue
        groups = {}
        for v in vals:
            groups.setdefault(norm(v), set()).add(v)
        for k, vs in sorted(groups.items()):
            if len(vs) > 1:
                graf.append({"coluna": c, "variantes": sorted(vs)})
    res["grafias"] = graf
    res["vazios"] = {c: sum(1 for r in rows if r[c].strip() == "") for c in cols
                     if any(r[c].strip() == "" for r in rows)}
    return res


at_rows = [r for r in read_csv_rows(RAW_CSV / "atividades_projeto.csv") if r["id_projeto"] == "P07"]
de_rows = [r for r in read_csv_rows(RAW_CSV / "despesas_projeto.csv") if r["id_projeto"] == "P07"]
write_csv(at_rows, OUT / "public/demo/atividades-P07.csv")
write_csv(de_rows, OUT / "public/demo/despesas-P07.csv")
G["auditor"] = {
    "atividades-P07.csv": auditar(at_rows),
    "despesas-P07.csv": auditar(de_rows),
}

# ---------------- gabaritos: ecra Confianca e dados do projeto (outro caminho de calculo) ----------------
_diarios = {"atividades": ativ_raw["data"], "despesas": desp["data"], "reunioes": coord["data"], "planos": planos["data"]}
_dts = pd.concat([s.map(pdate) for s in _diarios.values()])
_aulas = ativ[ativ["tipo_atividade"] == "aula"]["dt"]
_reg = {}
for _m in MESES:
    _ini = pd.Period(_m, freq="M").start_time
    _fim = pd.Period(_m, freq="M").end_time.normalize()
    _act = aloc_ok[(aloc_ok["di"] <= _fim) & (aloc_ok["df"] >= _ini)]
    _reg[_m] = int(_act["id_voluntario"].nunique())
_rep = met[met["metrica"] == "voluntarios_ativos"].groupby("periodo")["valor"].sum()
G["confianca"] = {
    "registosDiarios": int(len(_dts)),
    "registosDias28a31": int((_dts.dt.day >= 28).sum()),
    "esperadoDias28a31": int(round(len(_dts) * 83 / 731)),
    "aulasAoDomingo": r2((_aulas.dt.dayofweek == 6).mean() * 100),
    "despesasAoDomingo": r2((desp["dt"].dt.dayofweek == 6).mean() * 100),
    "voluntariosRegistados": _reg,
    "voluntariosReportados": {k: r2(_rep.get(k, 0)) for k in MESES},
}
_sk2 = skills.groupby("id_voluntario")["skill"].apply(set).to_dict()
_area = proj.set_index("id")["area_foco"].to_dict()
_ok = [(p_, _area[p_] in _sk2.get(v_, set())) for p_, v_ in zip(aloc_ok["id_projeto"], aloc_ok["id_voluntario"])]
_okdf = pd.DataFrame(_ok, columns=["p", "ok"])
G["projeto"]["competenciaCerta"] = {k: r2(v * 100) for k, v in _okdf.groupby("p")["ok"].mean().items()}
G["projeto"]["capacidadeParceiro"] = {r.id: int(parc.set_index("id").loc[r.parceiro_local_id, "capacidade_operacional"])
                                      for r in proj.itertuples()}

json.dump(G, open(OUT / "scripts/gabaritos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps({k: G[k] for k in ("fimDeAno", "simulacao", "qualidade")}, ensure_ascii=False, indent=1))
print(json.dumps(G["auditor"], ensure_ascii=False, indent=1))
print("custo comparaveis:", G["eficiencia"]["comparaveis"]["euro"])
print("hora comparaveis:", G["eficiencia"]["comparaveis"]["hora"]["posicao"])
