#!/usr/bin/env python3
"""Testa as hipoteses do Desafio 05 (Impacto social).
Uso: python3 -I analise.py <pasta_com_os_json>
Regras: data de referencia = ultimo registo; cada resultado com numero e denominador.
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


def load(n):
    with open(D / f"{n}.json", encoding="utf-8") as f:
        return pd.DataFrame(json.load(f))


proj = load("projetos")
vol = load("voluntarios")
skills = load("voluntarios_skills")
aloc = load("alocacoes_voluntarios")
ativ = load("atividades_projeto")
coord = load("coordenacao_eventos")
desp = load("despesas_projeto")
met = load("metricas_impacto")
planos = load("planos_investimento")

out = []


def p(*a):
    out.append(" ".join(str(x) for x in a))


def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.strip().lower()


def parse_date(s):
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


def pct(a, b):
    return f"{a / b * 100:.1f}% ({a:,.0f} de {b:,.0f})"


P = proj["id"].tolist()

# ---------------- limpeza ----------------
desp["dt"] = desp["data"].map(parse_date)
desp["iso"] = desp["data"].astype(str).str.match(r"^\d{4}-\d{2}-\d{2}$")
ativ["dt"] = ativ["data"].map(parse_date)
coord["dt"] = coord["data"].map(parse_date)
ref = max(desp["dt"].max(), ativ["dt"].max(), coord["dt"].max())

ativ_clean = ativ.drop(columns=["dt"]).drop_duplicates()
n_dup = len(ativ) - len(ativ_clean)
aloc_ok = aloc[aloc["id_projeto"].isin(P)].copy()
aloc_orf = aloc[~aloc["id_projeto"].isin(P)]
met["unid"] = met["unidade"].map(norm).replace(
    {"beneficiario": "beneficiarios", "beneficiaries": "beneficiarios"})

p("# Resultados")
p("data de referencia (ultimo registo de despesa, atividade ou evento):", ref.date())
p("atividades duplicadas removidas:", pct(n_dup, len(ativ)))
p("alocacoes com projeto inexistente (P99):", pct(len(aloc_orf), len(aloc)),
  f"| horas {aloc_orf['horas_realizadas'].sum():,.0f} de {aloc['horas_realizadas'].sum():,.0f}")
neg = desp[desp["valor"] < 0]
p("despesas negativas (estornos):", pct(len(neg), len(desp)),
  f"| valor {-neg['valor'].sum():,.2f} EUR de {desp.loc[desp['valor'] > 0, 'valor'].sum():,.2f} EUR brutos")
p("despesas com data DD/MM/AAAA:", pct(int((~desp["iso"]).sum()), len(desp)))
p("unidades de beneficiarios corrigidas:", int((met["unidade"] != met["unid"]).sum()))

# ---------------- tabela por projeto ----------------
g = pd.DataFrame(index=P)
pj = proj.set_index("id")
g["pais"] = pj["pais"]
g["area"] = pj["area_foco"]
g["orc_anual"] = pj["orcamento_anual"]
g["desp_liquida"] = desp.groupby("id_projeto")["valor"].sum()
g["desp_bruta"] = desp[desp["valor"] > 0].groupby("id_projeto")["valor"].sum()
g["estornos"] = -neg.groupby("id_projeto")["valor"].sum()
g["h_vol"] = aloc_ok.groupby("id_projeto")["horas_realizadas"].sum()
g["n_vol"] = aloc_ok.groupby("id_projeto")["id_voluntario"].nunique()
g["h_ativ"] = ativ_clean.groupby("id_projeto")["horas"].sum()
g["participantes"] = ativ_clean.groupby("id_projeto")["participantes"].sum()
for m in ["beneficiarios", "jovens_formados", "horas_formacao", "oficinas_realizadas"]:
    g[m] = met[met["metrica"] == m].groupby("id_projeto")["valor"].sum()
g["taxa_concl"] = met[met["metrica"] == "taxa_conclusao"].groupby("id_projeto")["valor"].mean()
g["vol_ativos"] = met[met["metrica"] == "voluntarios_ativos"].groupby("id_projeto")["valor"].mean()
g["eur_benef"] = g["desp_liquida"] / g["beneficiarios"]
g["benef_1000h"] = g["beneficiarios"] / g["h_vol"] * 1000
g["eur_jovem"] = g["desp_liquida"] / g["jovens_formados"]
g["eur_h_form"] = g["desp_liquida"] / g["horas_formacao"]
g["execucao"] = g["desp_liquida"] / (2 * g["orc_anual"])
g["h_coord"] = coord.groupby("id_projeto")["horas_reuniao"].sum()
g["coord_por_h_ativ"] = g["h_coord"] / g["h_ativ"]
pd.set_option("display.width", 250)
pd.set_option("display.max_columns", 40)
p("\n## Por projeto (24 meses)")
cols = ["pais", "area", "orc_anual", "desp_liquida", "estornos", "execucao", "h_vol", "n_vol",
        "beneficiarios", "jovens_formados", "horas_formacao", "taxa_concl", "eur_benef",
        "benef_1000h", "eur_jovem"]
p(g[cols].round(2).to_string())
tot_b = g["beneficiarios"].sum()
tot_d = g["desp_liquida"].sum()
p(f"\ntotais: despesa liquida {tot_d:,.2f} EUR; beneficiarios (soma mensal) {tot_b:,.2f}; "
  f"EUR/beneficiario global {tot_d / tot_b:,.2f}; horas de voluntariado {g['h_vol'].sum():,.0f}")

# metricas: fluxo mensal ou acumulado?
mb = met[met["metrica"] == "beneficiarios"].copy()
mb["mes"] = mb["periodo"].map(parse_date)
mono = mb.sort_values("mes").groupby("id_projeto")["valor"].apply(
    lambda s: bool(s.is_monotonic_increasing))
p("beneficiarios crescem sempre (acumulado?) em", int(mono.sum()), "de", len(mono), "projetos")

# ---------------- H1 ----------------
p("\n## H1 impacto total vs eficiencia")
rt = g["beneficiarios"].rank(ascending=False).astype(int)
re_ = g["eur_benef"].rank(ascending=True).astype(int)
rho, pv = stats.spearmanr(g["beneficiarios"], 1 / g["eur_benef"])
ratio = g["eur_benef"].max() / g["eur_benef"].min()
p(f"EUR/beneficiario: min {g['eur_benef'].min():,.2f} ({g['eur_benef'].idxmin()}) "
  f"max {g['eur_benef'].max():,.2f} ({g['eur_benef'].idxmax()}); razao {ratio:.2f}x")
p(f"Spearman(total de beneficiarios, beneficiarios por EUR) = {rho:.2f} (p={pv:.3f}, n=12)")
p("ranking total:", rt.sort_values().index.tolist())
p("ranking eficiencia:", re_.sort_values().index.tolist())
p("posicoes:", {k: (int(rt[k]), int(re_[k])) for k in P})

# ---------------- H2 limpeza muda o ranking ----------------
p("\n## H2 a limpeza muda a conclusao")
d_naive = desp[desp["iso"]]  # parser estrito: perde DD/MM/AAAA
naive_d = d_naive.groupby("id_projeto")["valor"].sum()
naive_b = met[(met["metrica"] == "beneficiarios") & (met["unidade"] == "beneficiarios")] \
    .groupby("id_projeto")["valor"].sum()
naive_e = naive_d / naive_b
rn = naive_e.rank().astype(int)
changed = int((rn != re_).sum())
rho2, _ = stats.spearmanr(rn, re_)
p(f"despesa perdida no parser estrito: {pct(desp.loc[~desp['iso'], 'valor'].sum(), desp['valor'].sum())}")
p(f"projetos que mudam de posicao: {changed} de 12; Spearman entre rankings {rho2:.2f}")
p("naive vs limpo:", {k: (int(rn[k]), int(re_[k])) for k in P})
dif = (naive_e / g["eur_benef"] - 1) * 100
p("diferenca do EUR/beneficiario naive (%):", dif.round(1).to_dict())
# so estornos ignorados (despesa bruta)
gross_e = g["desp_bruta"] / g["beneficiarios"]
rg = gross_e.rank().astype(int)
p(f"so a ignorar estornos: {int((rg != re_).sum())} mudam; diferenca media "
  f"{((gross_e / g['eur_benef'] - 1) * 100).mean():.1f}%")

# ---------------- H3 horas de voluntariado e impacto ----------------
p("\n## H3 horas de voluntariado e impacto")
r3, p3 = stats.spearmanr(g["h_vol"], g["beneficiarios"])
r3b, p3b = stats.spearmanr(g["h_vol"] / g["desp_liquida"], 1 / g["eur_benef"])
p(f"Spearman(horas de voluntariado, beneficiarios) entre projetos = {r3:.2f} (p={p3:.3f}, n=12)")
p(f"Spearman(horas por EUR, beneficiarios por EUR) = {r3b:.2f} (p={p3b:.3f}, n=12)")
rows = []
for r in aloc_ok.itertuples():
    s = parse_date(r.data_inicio)
    e = parse_date(r.data_fim)
    if pd.isna(e):
        e = ref
    days = pd.date_range(s, e, freq="D")
    if len(days) == 0:
        continue
    per_day = r.horas_realizadas / len(days)
    months = pd.Series(per_day, index=days).groupby(days.to_period("M")).sum()
    for mth, v in months.items():
        rows.append((r.id_projeto, mth.to_timestamp(), v))
hv = pd.DataFrame(rows, columns=["id_projeto", "mes", "h"]).groupby(["id_projeto", "mes"])["h"].sum()
mbm = mb.set_index(["id_projeto", "mes"])["valor"]
j = pd.concat([hv.rename("h"), mbm.rename("b")], axis=1).dropna()
j = j[(j.index.get_level_values("mes") >= "2024-01-01") & (j.index.get_level_values("mes") <= ref)]
jd = j.groupby(level=0).transform(lambda s: s - s.mean())
r3c, p3c = stats.spearmanr(jd["h"], jd["b"])
p(f"dentro de cada projeto, mes a mes: Spearman = {r3c:.2f} (p={p3c:.3f}, n={len(jd)} projeto-meses)")
hv_y = hv.groupby(hv.index.get_level_values("mes").year).sum()
p("horas de voluntariado por ano (repartidas pelos dias):", hv_y.round(0).to_dict())
mb["ano"] = mb["mes"].dt.year
p("beneficiarios por ano:", mb.groupby("ano")["valor"].sum().round(0).to_dict())
va = met[met["metrica"] == "voluntarios_ativos"].copy()
va["ano"] = va["periodo"].str[:4]
p("voluntarios_ativos (media mensal) por ano:", va.groupby("ano")["valor"].mean().round(1).to_dict())
p("alocacoes por ano de inicio:", aloc_ok["data_inicio"].str[:4].value_counts().sort_index().to_dict())

# ---------------- H4 investimento vs eficiencia ----------------
p("\n## H4 planos de investimento vs eficiencia")
ok = planos[planos["estado"].isin(["aprovado", "em_execucao", "concluido"])]
g["invest"] = ok.groupby("id_projeto")["valor_previsto"].sum().reindex(P).fillna(0)
g["invest_ampliacao"] = ok[ok["tipo"] == "ampliacao"].groupby("id_projeto")["valor_previsto"].sum() \
    .reindex(P).fillna(0)
r4, p4 = stats.spearmanr(g["invest"], 1 / g["eur_benef"])
top4 = g["eur_benef"].nsmallest(4).index
bot4 = g["eur_benef"].nlargest(4).index
p(f"planos aprovados/em execucao/concluidos: {len(ok)} de {len(planos)}; valor {ok['valor_previsto'].sum():,.2f} EUR")
p(f"Spearman(investimento, beneficiarios por EUR) = {r4:.2f} (p={p4:.3f}, n=12)")
p(f"4 mais eficientes {list(top4)} recebem {pct(g.loc[top4, 'invest'].sum(), g['invest'].sum())}")
p(f"4 menos eficientes {list(bot4)} recebem {pct(g.loc[bot4, 'invest'].sum(), g['invest'].sum())}")
p(f"ampliacao: 4 menos eficientes recebem "
  f"{pct(g.loc[bot4, 'invest_ampliacao'].sum(), g['invest_ampliacao'].sum())}")
p(g[["eur_benef", "invest", "invest_ampliacao"]].sort_values("eur_benef").round(0).to_string())

# ---------------- H5 competencias ----------------
p("\n## H5 voluntarios alocados por competencia")
sk = skills.groupby("id_voluntario")["skill"].apply(set)
a = aloc_ok.merge(proj[["id", "area_foco"]], left_on="id_projeto", right_on="id")
a["match"] = [ar in sk.get(v, set()) for v, ar in zip(a["id_voluntario"], a["area_foco"])]
p("alocacoes com competencia = area do projeto:", pct(int(a["match"].sum()), len(a)))
vol_skill_area = sum(1 for v in vol["id"] if sk.get(v, set()) & set(proj["area_foco"]))
p("voluntarios com pelo menos uma competencia de uma area dos projetos:", pct(vol_skill_area, len(vol)))
used = set(aloc_ok["id_voluntario"])
p("voluntarios nunca alocados:", pct(len(vol) - len(used), len(vol)))
hr = aloc_ok.groupby("id_voluntario")["horas_realizadas"].sum()
hd = vol.set_index("id")["horas_disponiveis"]
over = (hr > 2 * hd.reindex(hr.index)).sum()
p("voluntarios com mais horas feitas do que 2x as disponiveis:", pct(int(over), len(hr)))
m_by = a.groupby("id_projeto")["match"].mean()
r5, p5 = stats.spearmanr(m_by.reindex(P), 1 / g["eur_benef"])
p(f"Spearman(taxa de match do projeto, beneficiarios por EUR) = {r5:.2f} (p={p5:.3f})")
p("match por projeto:", (m_by * 100).round(1).to_dict())

# ---------------- H6 orcamento ----------------
p("\n## H6 despesa real vs orcamento anual")
fora = g[(g["execucao"] < 0.75) | (g["execucao"] > 1.25)]
p("projetos fora de +-25%:", pct(len(fora), 12), "|", fora["execucao"].round(2).to_dict())
p("execucao por projeto:", g["execucao"].round(2).to_dict())
dy = desp.assign(ano=desp["dt"].dt.year).groupby(["id_projeto", "ano"])["valor"].sum().unstack()
p((dy.div(g["orc_anual"], axis=0)).round(2).to_string())

# ---------------- extra ----------------
p("\n## Extra")
cat = desp.groupby(["id_projeto", "categoria"])["valor"].sum().unstack()
p("peso de cada categoria na despesa (%):")
p((cat.div(cat.sum(axis=1), axis=0) * 100).round(1).to_string())
p("resultado das atividades (normalizado):",
  ativ_clean["resultado_atividade"].fillna("").map(norm).replace({"": "(vazio)"}).value_counts().to_dict())
p("coordenacao: horas de reuniao por hora de atividade:", g["coord_por_h_ativ"].round(3).to_dict())

g.round(4).to_csv(Path(sys.argv[2]) if len(sys.argv) > 2 else "/dev/null")
print("\n".join(out))
