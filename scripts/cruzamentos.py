#!/usr/bin/env python3
"""Cruza as 10 tabelas entre si (relacoes entre fontes).
Segue as skills data-analysis e exploratory-data-analysis: Spearman com correcao de
Benjamini-Hochberg, efeito e n em cada resultado; qui-quadrado com V de Cramer.
Uso: python3 -I cruzamentos.py <pasta_json> <public/data/mensal.json>
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

D = Path(sys.argv[1])
mensal = pd.DataFrame(json.load(open(sys.argv[2], encoding="utf-8")))


def load(n):
    with open(D / f"{n}.json", encoding="utf-8") as f:
        return pd.DataFrame(json.load(f))


def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s.strip().lower())


def pdate(s):
    s = str(s).strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
        return pd.Timestamp(s)
    if re.match(r"^\d{2}/\d{2}/\d{4}$", s):
        return pd.to_datetime(s, format="%d/%m/%Y")
    return pd.NaT


def bh(p):
    p = np.asarray(p, float)
    n = len(p)
    o = np.argsort(p)
    q = np.empty(n)
    prev = 1.0
    for i in range(n - 1, -1, -1):
        k = o[i]
        prev = min(prev, p[k] * n / (i + 1))
        q[k] = prev
    return q


def cramers_v(ct):
    chi2, pv, _, _ = stats.chi2_contingency(ct)
    n = ct.to_numpy().sum()
    r, k = ct.shape
    return chi2, pv, np.sqrt(chi2 / (n * (min(r, k) - 1)))


proj = load("projetos")
parc = load("parceiros_locais")
vol = load("voluntarios")
skills = load("voluntarios_skills")
aloc = load("alocacoes_voluntarios")
ativ = load("atividades_projeto").drop_duplicates()
coord = load("coordenacao_eventos")
desp = load("despesas_projeto")
met = load("metricas_impacto")
planos = load("planos_investimento")
P = proj["id"].tolist()
aloc = aloc[aloc["id_projeto"].isin(P)]
ativ["res"] = ativ["resultado_atividade"].fillna("").map(norm).replace({"": "sem registo"})
desp["dt"] = desp["data"].map(pdate)
out = []


def p(*a):
    out.append(" ".join(str(x) for x in a))


pd.set_option("display.width", 250)

# ---------------- 1. nivel do projeto (n = 12) ----------------
m = mensal[~mensal["fimDeAno"]]
g = m.groupby("projeto").agg(despesa=("despesa", "sum"), estornos=("estornos", "sum"), atividades=("atividades", "sum"),
                             participantes=("participantes", "sum"), horasVol=("horasVoluntariado", "sum"),
                             beneficiarios=("beneficiarios", "sum"), jovens=("jovensFormados", "sum"),
                             horasFormacao=("horasFormacao", "sum"), oficinas=("oficinas", "sum"),
                             taxaConclusao=("taxaConclusao", "mean"), volReportados=("voluntariosReportados", "mean"),
                             horasReuniao=("horasReuniao", "sum"), horasAtividade=("horasAtividade", "sum"))
g["eficiencia"] = g["beneficiarios"] / g["despesa"] * 1e6  # beneficiarios por milhao de euros
g["estornosPct"] = g["estornos"] / (g["despesa"] + g["estornos"]) * 100
g["participantesPorAtividade"] = g["participantes"] / g["atividades"]
g["custoPorAtividade"] = g["despesa"] / g["atividades"]
g["beneficiariosPorAtividade"] = g["beneficiarios"] / g["atividades"]
g["reuniaoPorHoraAtividade"] = g["horasReuniao"] / g["horasAtividade"]
pj = proj.set_index("id")
g["orcamento"] = pj["orcamento_anual"]
g["idade"] = 2025 - pj["ano_inicio"]
g["emAvaliacao"] = (pj["estado"] == "em_avaliacao").astype(int)
pp = parc.set_index("id")
g["capacidadeParceiro"] = pj["parceiro_local_id"].map(pp["capacidade_operacional"])
g["historicoParceiro"] = pj["parceiro_local_id"].map(pp["historico_colaboracao"]).map({"recente": 1, "medio": 2, "longo": 3})
sk = skills.groupby("id_voluntario")["skill"].apply(set)
am = aloc.merge(proj[["id", "area_foco"]], left_on="id_projeto", right_on="id").merge(
    vol[["id", "anos_experiencia", "localizacao_base", "departamento_lufthansa"]], left_on="id_voluntario",
    right_on="id", suffixes=("", "_v"))
am["match"] = [a in sk.get(v, set()) for v, a in zip(am["id_voluntario"], am["area_foco"])]
g["competenciaCerta"] = am.groupby("id_projeto")["match"].mean() * 100
g["experienciaMedia"] = am.groupby("id_projeto")["anos_experiencia"].mean()
g["interrompidasPct"] = aloc.groupby("id_projeto")["estado_alocacao"].apply(lambda s: (s == "interrompida").mean() * 100)
r = ativ.groupby("id_projeto")["res"]
g["objetivosAtingidosPct"] = r.apply(lambda s: (s == "objetivos atingidos").mean() * 100)
g["comAtrasoPct"] = r.apply(lambda s: (s == "com atraso").mean() * 100)
g["semResultadoPct"] = r.apply(lambda s: (s == "sem registo").mean() * 100)
ok = planos[planos["estado"].isin(["aprovado", "em_execucao", "concluido"])]
g["investimentoAprovado"] = ok.groupby("id_projeto")["valor_previsto"].sum().reindex(P).fillna(0)
g["investimentoPorEuroGasto"] = g["investimentoAprovado"] / g["despesa"]
cat = desp.groupby(["id_projeto", "categoria"])["valor"].sum().unstack()
g["pessoalPct"] = cat["pessoal"] / cat.sum(axis=1) * 100
g["outrosPct"] = cat["outros"] / cat.sum(axis=1) * 100

alvo = "eficiencia"
rows = []
for c in g.columns:
    if c in (alvo, "despesa", "beneficiarios"):
        continue
    rho, pv = stats.spearmanr(g[c], g[alvo])
    rows.append((c, rho, pv))
t = pd.DataFrame(rows, columns=["variavel", "rho", "p"])
t["q_BH"] = bh(t["p"])
t = t.reindex(t["rho"].abs().sort_values(ascending=False).index)
p("## 1. O que anda com a eficiencia (beneficiarios por milhao de euros, jan-out), n = 12 projetos")
p(t.round(3).to_string(index=False))

# ---------------- 2. mes a mes, dentro de cada projeto (jan-out) ----------------
p("\n## 2. Mes a mes dentro de cada projeto (jan-out; desvios a media do projeto), n = 240")
cols = ["despesa", "atividades", "participantes", "horasVoluntariado", "voluntariosRegistados", "reunioes",
        "beneficiarios", "jovensFormados", "horasFormacao", "oficinas", "taxaConclusao", "voluntariosReportados"]
dm = m.set_index(["projeto", "mes"])[cols]
dm = dm - dm.groupby(level=0).transform("mean")
pairs = []
for i, a in enumerate(cols):
    for b in cols[i + 1:]:
        rho, pv = stats.spearmanr(dm[a], dm[b])
        pairs.append((a, b, rho, pv))
pt = pd.DataFrame(pairs, columns=["a", "b", "rho", "p"])
pt["q_BH"] = bh(pt["p"])
p("pares com q < 0,05:")
p(pt[pt["q_BH"] < 0.05].sort_values("rho", key=abs, ascending=False).round(3).to_string(index=False))
p("recursos -> beneficiarios:", pt[(pt["b"] == "beneficiarios") | (pt["a"] == "beneficiarios")]
  .round(3)[["a", "b", "rho", "q_BH"]].values.tolist())
# com novembro e dezembro, para comparar
dm2 = mensal.set_index(["projeto", "mes"])[cols]
dm2 = dm2 - dm2.groupby(level=0).transform("mean")
for a in ["atividades", "despesa", "horasVoluntariado"]:
    rho, pv = stats.spearmanr(dm2[a], dm2["beneficiarios"])
    p(f"com nov-dez: {a} x beneficiarios rho={rho:.2f} p={pv:.3g}")

# ---------------- 3. atividades: resultado x recurso, tipo, projeto ----------------
p("\n## 3. Atividades (n = %d)" % len(ativ))
for c in ["recursos_utilizados", "tipo_atividade", "id_projeto"]:
    ct = pd.crosstab(ativ[c].str.strip(), ativ["res"])
    chi2, pv, v = cramers_v(ct)
    p(f"resultado x {c}: qui2={chi2:.1f} p={pv:.3g} V de Cramer={v:.3f}")
kw = stats.kruskal(*[s["participantes"].values for _, s in ativ.groupby(ativ["tipo_atividade"].str.strip())])
p(f"participantes por tipo de atividade: Kruskal H={kw.statistic:.1f} p={kw.pvalue:.3g}")
p("participantes medios por resultado:", ativ.groupby("res")["participantes"].mean().round(1).to_dict())

# ---------------- 4. voluntarios: cidade, departamento, experiencia ----------------
p("\n## 4. Voluntarios alocados (n = %d alocacoes)" % len(am))
lusofonos = {"Brasil", "Portugal", "Mocambique"}
am["lusofono"] = am["id_projeto"].map(pj["pais"]).isin(lusofonos)
am["baseLusa"] = am["localizacao_base"].isin(["Lisboa", "Porto"])
ct = pd.crosstab(am["baseLusa"], am["lusofono"])
chi2, pv, v = cramers_v(ct)
p(f"base em Lisboa/Porto x projeto em pais lusofono: qui2={chi2:.2f} p={pv:.3g} V={v:.3f}")
p("  % das alocacoes de quem vive em Lisboa/Porto que vao para paises lusofonos:",
  round(am.loc[am.baseLusa, "lusofono"].mean() * 100, 1), "| restantes:", round(am.loc[~am.baseLusa, "lusofono"].mean() * 100, 1))
for c in ["localizacao_base", "departamento_lufthansa"]:
    ct = pd.crosstab(am[c], am["id_projeto"])
    chi2, pv, v = cramers_v(ct)
    p(f"{c} x projeto: qui2={chi2:.1f} p={pv:.3g} V={v:.3f}")
ct = pd.crosstab(am["departamento_lufthansa"], am["match"])
chi2, pv, v = cramers_v(ct)
p(f"departamento x competencia certa: p={pv:.3g} V={v:.3f}")
rho, pv = stats.spearmanr(am["anos_experiencia"], am["horas_realizadas"])
p(f"experiencia x horas feitas: rho={rho:.3f} p={pv:.3g}")
ct = pd.crosstab(am["papel"], pd.cut(am["anos_experiencia"], [-1, 2, 10, 30]))
chi2, pv, v = cramers_v(ct)
p(f"papel x experiencia: p={pv:.3g} V={v:.3f}")
ct = pd.crosstab(am["match"], am["estado_alocacao"])
p("competencia certa x estado:", ct.to_dict())

# ---------------- 5. planos -> metricas depois (estudo de evento, descritivo) ----------------
p("\n## 5. Planos concluidos ou em execucao: beneficiarios 3 meses antes e 3 meses depois (sem nov-dez)")
mb = mensal[["projeto", "mes", "beneficiarios", "jovensFormados", "fimDeAno"]].copy()
mb["t"] = pd.PeriodIndex(mb["mes"], freq="M")
ev = []
for r_ in planos[planos["estado"].isin(["concluido", "em_execucao"])].itertuples():
    t0 = pd.Period(str(pdate(r_.data))[:7], freq="M")
    s = mb[(mb["projeto"] == r_.id_projeto) & (~mb["fimDeAno"])]
    antes = s[(s["t"] < t0) & (s["t"] >= t0 - 3)]["beneficiarios"].mean()
    depois = s[(s["t"] > t0) & (s["t"] <= t0 + 3)]["beneficiarios"].mean()
    if not np.isnan(antes) and not np.isnan(depois):
        ev.append((r_.tipo, depois / antes - 1))
evd = pd.DataFrame(ev, columns=["tipo", "var"])
p("variacao media depois/antes por tipo:", (evd.groupby("tipo")["var"].agg(["mean", "count"]).round(3)).to_dict())
p("tendencia de base (variacao media de 3 meses em todos os meses):",
  round(mb[~mb.fimDeAno].groupby("projeto")["beneficiarios"].apply(lambda s: (s.shift(-3) / s - 1).mean()).mean(), 3))

# ---------------- 6. despesa x atividades por categoria (mes a mes) ----------------
p("\n## 6. Estornos e despesa: relacao com atividades e resultado")
dm3 = m.set_index(["projeto", "mes"])[["estornos", "atividades", "beneficiarios"]]
dm3 = dm3 - dm3.groupby(level=0).transform("mean")
for a in ["atividades", "beneficiarios"]:
    rho, pv = stats.spearmanr(dm3["estornos"], dm3[a])
    p(f"estornos x {a} (mes a mes): rho={rho:.2f} p={pv:.3g}")

print("\n".join(out))
