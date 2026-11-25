#!/usr/bin/env python3
"""Procura padroes escondidos em todas as tabelas do Desafio 05.
Uso: python3 -I anomalias.py <pasta_json>
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd

D = Path(sys.argv[1])


def load(n):
    with open(D / f"{n}.json", encoding="utf-8") as f:
        return pd.DataFrame(json.load(f))


def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.strip().lower()


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


proj = load("projetos")
vol = load("voluntarios")
skills = load("voluntarios_skills")
aloc = load("alocacoes_voluntarios")
ativ = load("atividades_projeto")
coord = load("coordenacao_eventos")
desp = load("despesas_projeto")
met = load("metricas_impacto")
planos = load("planos_investimento")
P = proj["id"].tolist()
pais = proj.set_index("id")["pais"]

for df, col in [(ativ, "data"), (coord, "data"), (desp, "data"), (planos, "data")]:
    df["dt"] = df[col].map(pdate)
aloc["di"] = aloc["data_inicio"].map(pdate)
aloc["df"] = aloc["data_fim"].map(pdate)
met["dt"] = met["periodo"].map(pdate)
ativ["dup"] = ativ.duplicated(subset=[c for c in ativ.columns if c not in ("dt",)], keep="first")
desp["ddmm"] = ~desp["data"].astype(str).str.match(r"^\d{4}-\d{2}-\d{2}$")
met["unid_var"] = met["unidade"] != "beneficiarios"
met.loc[met["metrica"] != "beneficiarios", "unid_var"] = False
ativ["caps"] = ativ["resultado_atividade"].fillna("").str.match(r"^[A-Z]")
ativ["sem_res"] = ativ["resultado_atividade"].fillna("").map(norm).isin(["", "sem registo"])
desp["caps"] = desp["descricao_curta"].fillna("").str.match(r"^[A-Z]")
desp["vazia"] = desp["descricao_curta"].fillna("").str.strip() == ""

out = []


def p(*a):
    out.append(" ".join(str(x) for x in a))


pd.set_option("display.width", 260)
pd.set_option("display.max_columns", 40)
pd.set_option("display.max_rows", 80)

# ---------- 1. series mensais de todas as tabelas ----------
p("## 1. Por mes (contagens e problemas)")
M = pd.period_range("2024-01", "2025-12", freq="M")
t = pd.DataFrame(index=M)
t["ativ"] = ativ.groupby(ativ["dt"].dt.to_period("M")).size()
t["ativ_dup"] = ativ[ativ["dup"]].groupby(ativ["dt"].dt.to_period("M")).size()
t["ativ_caps"] = ativ[ativ["caps"]].groupby(ativ["dt"].dt.to_period("M")).size()
t["ativ_semres"] = ativ[ativ["sem_res"]].groupby(ativ["dt"].dt.to_period("M")).size()
t["part_media"] = ativ.groupby(ativ["dt"].dt.to_period("M"))["participantes"].mean().round(1)
t["desp_n"] = desp.groupby(desp["dt"].dt.to_period("M")).size()
t["desp_keur"] = (desp.groupby(desp["dt"].dt.to_period("M"))["valor"].sum() / 1000).round(0)
t["desp_neg"] = desp[desp["valor"] < 0].groupby(desp["dt"].dt.to_period("M")).size()
t["desp_ddmm"] = desp[desp["ddmm"]].groupby(desp["dt"].dt.to_period("M")).size()
t["desp_caps"] = desp[desp["caps"]].groupby(desp["dt"].dt.to_period("M")).size()
t["desp_vazia"] = desp[desp["vazia"]].groupby(desp["dt"].dt.to_period("M")).size()
t["coord"] = coord.groupby(coord["dt"].dt.to_period("M")).size()
t["aloc_ini"] = aloc.groupby(aloc["di"].dt.to_period("M")).size()
t["aloc_p99"] = aloc[aloc["id_projeto"] == "P99"].groupby(aloc["di"].dt.to_period("M")).size()
t["planos"] = planos.groupby(planos["dt"].dt.to_period("M")).size()
mb = met[met["metrica"] == "beneficiarios"]
t["benef"] = mb.groupby(mb["dt"].dt.to_period("M"))["valor"].sum().round(0)
t["unid_var"] = met[met["unid_var"]].groupby(met["dt"].dt.to_period("M")).size()
p(t.fillna(0).astype(int).to_string())

# ---------- 2. dia da semana ----------
p("\n## 2. Dia da semana (% de registos ao sabado e domingo; esperado ~28,6% se ao acaso)")
for name, df, col in [("atividades", ativ, "dt"), ("despesas", desp, "dt"), ("coordenacao", coord, "dt"),
                      ("planos", planos, "dt"), ("alocacoes (inicio)", aloc, "di")]:
    wd = df[col].dt.dayofweek
    p(f"{name}: fim de semana {(wd >= 5).mean() * 100:.1f}% | por dia {wd.value_counts().sort_index().to_dict()}")
wk = ativ.assign(fds=ativ["dt"].dt.dayofweek >= 5).groupby("id_projeto")["fds"].mean() * 100
p("atividades ao fim de semana por projeto (%):", wk.round(1).to_dict())
wk2 = desp.assign(fds=desp["dt"].dt.dayofweek >= 5).groupby("id_projeto")["fds"].mean() * 100
p("despesas ao fim de semana por projeto (%):", wk2.round(1).to_dict())

# ---------- 3. feriados nacionais (fonte externa: biblioteca holidays) ----------
p("\n## 3. Registos em feriados nacionais do pais do projeto")
try:
    import holidays as hol
    code = {"Brasil": "BR", "Quenia": "KE", "India": "IN", "Portugal": "PT", "Ghana": "GH", "Peru": "PE",
            "Senegal": "SN", "Bangladesh": "BD", "Colombia": "CO", "Filipinas": "PH", "Uganda": "UG",
            "Mocambique": "MZ"}
    cal = {}
    for pid in P:
        c = code[pais[pid]]
        try:
            cal[pid] = hol.country_holidays(c, years=[2024, 2025])
        except Exception as e:  # pais sem calendario
            cal[pid] = None
            p("sem calendario:", pid, c, type(e).__name__)
    for name, df in [("atividades", ativ), ("despesas", desp), ("coordenacao", coord)]:
        rows = []
        for pid in P:
            if cal[pid] is None:
                continue
            sub = df[df["id_projeto"] == pid]
            days = pd.Series(sorted(set(pd.Timestamp(d) for d in cal[pid].keys())))
            share_days = len(days) / 731
            on = sub["dt"].dt.normalize().isin(days).mean()
            rows.append((pid, pais[pid], len(days), round(share_days * 100, 1), round(on * 100, 1)))
        p(f"{name}: (projeto, pais, n feriados, % de dias que sao feriado, % de registos em feriado)")
        p("  ", rows)
    # 25 de dezembro e 1 de janeiro em todas
    for name, df in [("atividades", ativ), ("despesas", desp), ("coordenacao", coord)]:
        md = df["dt"].dt.strftime("%m-%d")
        p(f"{name} a 25/12: {int((md == '12-25').sum())}; a 01/01: {int((md == '01-01').sum())}; "
          f"media por dia do ano: {len(df) / 731:.1f}")
except ImportError:
    p("biblioteca holidays indisponivel")

# ---------- 4. despesas: valores ----------
p("\n## 4. Despesas: valores")
pos = desp[desp["valor"] > 0]
st = pos.groupby("id_projeto")["valor"].agg(["count", "median", "mean", "max"]).round(0)
st["n_total"] = desp.groupby("id_projeto").size()
p(st.to_string())
fd = pos["valor"].astype(str).str.lstrip("0.").str[0].astype(int)
ben = {d: np.log10(1 + 1 / d) for d in range(1, 10)}
obs = fd.value_counts(normalize=True).sort_index()
p("Benford (1o digito, % observado vs esperado):",
  {d: (round(obs.get(d, 0) * 100, 1), round(ben[d] * 100, 1)) for d in range(1, 10)})
for pid in P:
    s = pos[pos["id_projeto"] == pid]["valor"].astype(str).str.lstrip("0.").str[0].astype(int)
    o = s.value_counts(normalize=True).reindex(range(1, 10), fill_value=0)
    mad = float(np.mean([abs(o[d] - ben[d]) for d in range(1, 10)]))
    out.append(f"  {pid} MAD Benford {mad:.3f} | 1o digito {(o * 100).round(0).astype(int).to_dict()}")
rnd = pos[(pos["valor"] % 100 == 0)]
p("valores redondos (multiplos de 100):", len(rnd), "de", len(pos))
rep = pos.groupby(["id_projeto", "valor"]).size()
p("valores repetidos no mesmo projeto (mesmo valor, 2+ vezes):", int((rep > 1).sum()))
for th in [1000, 2500, 5000, 10000, 15000, 20000]:
    below = ((pos["valor"] >= th * 0.95) & (pos["valor"] < th)).sum()
    above = ((pos["valor"] >= th) & (pos["valor"] < th * 1.05)).sum()
    p(f"limiar {th}: 5% abaixo {below} | 5% acima {above}")
hist = np.histogram(pos["valor"], bins=[0, 500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000])
p("histograma:", dict(zip([f"{a:.0f}-{b:.0f}" for a, b in zip(hist[1][:-1], hist[1][1:])], hist[0].tolist())))
big = pos[pos["valor"] > pos["valor"].quantile(0.75) + 3 * (pos["valor"].quantile(0.75) - pos["valor"].quantile(0.25))]
p("despesas muito altas (>3xIQR):", len(big), "| por projeto", big.groupby("id_projeto").size().to_dict())
p("   por categoria", big.groupby("categoria").size().to_dict(), "| por mes",
  big.groupby(big["dt"].dt.to_period("M")).size().to_dict())
# mes do ano: dezembro?
p("despesa por mes do ano (kEUR):", (desp.groupby(desp["dt"].dt.month)["valor"].sum() / 1000).round(0).to_dict())
p("despesa por dia do mes (n):", desp.groupby(desp["dt"].dt.day).size().to_dict())

# ---------- 5. estornos ----------
p("\n## 5. Estornos")
neg = desp[desp["valor"] < 0].copy()
neg["abs"] = (-neg["valor"]).round(2)
allpos = set(pos["valor"].round(2))
p("negativos com um positivo de igual valor em qualquer projeto:", int(neg["abs"].isin(allpos).sum()), "de", len(neg))
p("negativos por projeto:", neg.groupby("id_projeto").size().to_dict())
p("negativos por categoria:", neg.groupby("categoria").size().to_dict())
p("valor absoluto dos negativos: mediana", round(neg["abs"].median(), 2), "| positivos: mediana",
  round(pos["valor"].median(), 2))
p("negativos com data DD/MM:", int(neg["ddmm"].sum()), "de", len(neg))

# ---------- 6. alocacoes: viabilidade ----------
p("\n## 6. Alocacoes")
a = aloc.copy()
a["dias"] = (a["df"].fillna(pd.Timestamp("2025-12-27")) - a["di"]).dt.days + 1
a["h_dia"] = a["horas_realizadas"] / a["dias"]
p("duracao (dias):", a["dias"].describe().round(1).to_dict())
p("horas por dia: ", a["h_dia"].describe().round(2).to_dict())
p("alocacoes com mais de 8 h por dia:", int((a["h_dia"] > 8).sum()), "| mais de 24 h:", int((a["h_dia"] > 24).sum()))
# sobreposicao por voluntario
a = a.sort_values(["id_voluntario", "di"])
ov = 0
ov_pais = 0
for v, g in a.groupby("id_voluntario"):
    rows = g[["di", "df", "id_projeto"]].values
    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            e_i = rows[i][1] if not pd.isna(rows[i][1]) else pd.Timestamp("2025-12-27")
            if rows[j][0] <= e_i:
                ov += 1
                if rows[i][2] != rows[j][2]:
                    ov_pais += 1
p("pares de alocacoes sobrepostas do mesmo voluntario:", ov, "| em projetos diferentes:", ov_pais)
vx = a.merge(vol[["id", "anos_experiencia"]], left_on="id_voluntario", right_on="id")
p("mentores/formadores com 0 anos de experiencia:",
  int(((vx["papel"].isin(["mentor", "formador"])) & (vx["anos_experiencia"] == 0)).sum()))
p("alocacoes por mes de inicio em 2025:", a[a["di"].dt.year == 2025].groupby(a["di"].dt.to_period("M")).size().to_dict())
p("ultima data de inicio:", a["di"].max().date(), "| ultima data de fim:", a["df"].max().date())

# ---------- 7. coordenacao ----------
p("\n## 7. Coordenacao")
p("reunioes com mais de 12 h:", int((coord["horas_reuniao"] > 12).sum()), "| mais de 24 h:",
  int((coord["horas_reuniao"] > 24).sum()))
p("top horas:", coord.nlargest(5, "horas_reuniao")[["id", "id_projeto", "data", "tipo_evento", "horas_reuniao"]].values.tolist())

# ---------- 8. metricas ----------
p("\n## 8. Metricas")
p(met.groupby("metrica")["valor"].describe().round(2).to_string())
# metodo de recolha: vies dentro de projeto e metrica
met["rel"] = met["valor"] / met.groupby(["id_projeto", "metrica"])["valor"].transform("mean")
p("valor relativo a media do projeto, por metodo de recolha:")
p(met.groupby(["metrica", "metodo_recolha"])["rel"].mean().unstack().round(3).to_string())
p("metodo por ano:", met.groupby([met["dt"].dt.year, "metodo_recolha"]).size().unstack().to_dict())
# saltos mensais (z-score da variacao) por projeto e metrica
mm = met.sort_values("dt").copy()
mm["z"] = mm.groupby(["id_projeto", "metrica"])["valor"].transform(lambda s: (s - s.mean()) / s.std())
p("pontos com |z| > 3:", int((mm["z"].abs() > 3).sum()), "| exemplos:",
  mm.loc[mm["z"].abs() > 3, ["id_projeto", "periodo", "metrica", "valor"]].values.tolist()[:12])
# tendencia: media 2024 vs 2025 por metrica
mm["ano"] = mm["dt"].dt.year
p("media mensal por ano:", mm.groupby(["metrica", "ano"])["valor"].mean().unstack().round(1).to_dict())
# padrao sazonal: media por mes do ano (todos os projetos), por metrica
p("media por mes do ano (beneficiarios):", mm[mm.metrica == "beneficiarios"].groupby(mm["dt"].dt.month)["valor"].mean().round(1).to_dict())

# voluntarios ativos reportados vs alocacoes ativas
rows = []
for m in pd.period_range("2024-01", "2025-12", freq="M"):
    s, e = m.start_time, m.end_time
    act = aloc[(aloc["di"] <= e) & (aloc["df"].fillna(pd.Timestamp("2025-12-27")) >= s) & (aloc["id_projeto"].isin(P))]
    rows.append((str(m), act["id_voluntario"].nunique()))
va = met[met.metrica == "voluntarios_ativos"].groupby("periodo")["valor"].sum().round(0)
cmp_ = pd.DataFrame(rows, columns=["mes", "ativos_alocacoes"]).set_index("mes")
cmp_["reportados_soma"] = va
p("voluntarios ativos: alocacoes vs metrica reportada (soma dos 12 projetos):")
p(cmp_.T.to_string())
# participantes das atividades vs beneficiarios (por projeto e mes)
ap = ativ[~ativ["dup"]].groupby(["id_projeto", ativ["dt"].dt.to_period("M")])["participantes"].sum()
bm = mb.groupby(["id_projeto", mb["dt"].dt.to_period("M")])["valor"].sum()
jj = pd.concat([ap.rename("part"), bm.rename("ben")], axis=1).dropna()
p("correlacao participantes x beneficiarios (projeto-mes):", round(jj.corr(method="spearman").iloc[0, 1], 2),
  "| razao media beneficiarios/participantes:", round((jj["ben"] / jj["part"]).mean(), 4))

# ---------- 9. quase duplicados ----------
p("\n## 9. Quase duplicados")
k = ["id_projeto", "categoria", "valor"]
d2 = desp[desp.duplicated(subset=k, keep=False)].sort_values(k)
p("despesas com mesmo projeto, categoria e valor (ids diferentes):", len(d2))
if len(d2):
    p(d2[["id", "id_projeto", "data", "categoria", "valor", "descricao_curta"]].head(12).to_string())
k2 = ["id_projeto", "data", "tipo_atividade", "participantes", "horas"]
a2 = ativ[~ativ["dup"]]
a2d = a2[a2.duplicated(subset=k2, keep=False)]
p("atividades iguais com ids diferentes:", len(a2d))
p("ids duplicados de atividades: por projeto", ativ[ativ["dup"]].groupby("id_projeto").size().to_dict())

# ---------- 10. projetos em avaliacao e planos ----------
p("\n## 10. Estado dos projetos e planos")
p(proj[["id", "pais", "estado", "ano_inicio"]].values.tolist())
p("planos por projeto e estado:")
p(planos.groupby(["id_projeto", "estado"]).size().unstack(fill_value=0).to_string())
p("planos de ampliacao em projetos em avaliacao:",
  planos[(planos["tipo"] == "ampliacao") & planos["id_projeto"].isin(proj.loc[proj.estado == "em_avaliacao", "id"])][["id_projeto", "estado", "valor_previsto"]].values.tolist())

print("\n".join(out))
