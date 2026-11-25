#!/usr/bin/env python3
"""Perfil rapido dos dados do Desafio 05 (Impacto social).
Uso: python3 -I perfil_rapido.py <pasta_dados_com_csv_e_json>
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

BASE = Path(sys.argv[1])
TABLES = [
    "projetos", "parceiros_locais", "voluntarios", "voluntarios_skills",
    "alocacoes_voluntarios", "atividades_projeto", "coordenacao_eventos",
    "despesas_projeto", "metricas_impacto", "planos_investimento",
]
DATE_COLS = {"data", "data_inicio", "data_fim", "periodo"}
NUM_HINT = ("valor", "horas", "participantes", "orcamento", "anos_experiencia",
            "capacidade", "ano_inicio")

out = []


def p(*a):
    out.append(" ".join(str(x) for x in a))


def is_empty(v):
    if v is None:
        return True
    if isinstance(v, float) and np.isnan(v):
        return True
    return isinstance(v, str) and v.strip() == ""


def typename(v):
    return "vazio" if is_empty(v) else type(v).__name__


def norm_txt(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"[\s_\-]+", " ", s.strip().lower())


DATE_PATTERNS = [
    ("AAAA-MM-DD", re.compile(r"^\d{4}-\d{2}-\d{2}$")),
    ("DD/MM/AAAA", re.compile(r"^\d{2}/\d{2}/\d{4}$")),
    ("AAAA/MM/DD", re.compile(r"^\d{4}/\d{2}/\d{2}$")),
    ("DD-MM-AAAA", re.compile(r"^\d{2}-\d{2}-\d{4}$")),
    ("AAAA-MM", re.compile(r"^\d{4}-\d{2}$")),
    ("AAAA-MM-DD hh:mm", re.compile(r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}")),
]


def date_kind(v):
    if is_empty(v):
        return "vazio"
    s = str(v).strip()
    for k, rx in DATE_PATTERNS:
        if rx.match(s):
            return k
    return "outro:" + s[:20]


def parse_date(v):
    if is_empty(v):
        return pd.NaT
    s = str(v).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m"):
        try:
            return pd.to_datetime(s, format=fmt)
        except (ValueError, TypeError):
            pass
    try:
        return pd.to_datetime(s[:19])
    except (ValueError, TypeError):
        return pd.NaT


def parse_num(v):
    if is_empty(v):
        return np.nan
    if isinstance(v, (int, float, np.integer, np.floating)) and not isinstance(v, bool):
        return float(v)
    s = str(v).strip().replace("\xa0", "").replace(" ", "").replace("€", "")
    if re.match(r"^-?\d{1,3}(\.\d{3})+(,\d+)?$", s):
        s = s.replace(".", "").replace(",", ".")
    else:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return np.nan


frames = {}
for t in TABLES:
    c = pd.read_csv(BASE / "csv" / f"{t}.csv", sep=";", dtype=str,
                    encoding="utf-8-sig", keep_default_na=False)
    with open(BASE / "json" / f"{t}.json", encoding="utf-8") as f:
        raw = json.load(f)
    j = pd.DataFrame(raw)
    frames[t] = (c, j)

proj_ids = set(frames["projetos"][1]["id"].astype(str))
vol_ids = set(frames["voluntarios"][1]["id"].astype(str))
parc_ids = set(frames["parceiros_locais"][1]["id"].astype(str))
FK = {"id_projeto": proj_ids, "id_voluntario": vol_ids, "parceiro_local_id": parc_ids}

for t in TABLES:
    c, j = frames[t]
    p(f"\n## {t}: CSV {len(c)} linhas, JSON {len(j)} linhas")
    p("  colunas:", ", ".join(j.columns))
    if list(c.columns) != list(j.columns):
        p("  ! colunas diferentes CSV vs JSON:", list(c.columns), "|", list(j.columns))
    if "id" in j.columns:
        ids = j["id"].astype(str)
        dup = ids.duplicated(keep=False)
        p(f"  ids repetidos: {int(dup.sum())} linhas ({ids[dup].nunique()} ids)")
        cols = [x for x in j.columns if x != "id"]
        same = j[cols].astype(str).duplicated(keep=False)
        p(f"  linhas iguais exceto o id: {int(same.sum())}")
        sc, sj = set(c["id"]), set(ids)
        if sc != sj:
            p(f"  ! ids so no CSV: {len(sc - sj)}; so no JSON: {len(sj - sc)}")
        # CSV vs JSON, mesmo id (primeira ocorrencia)
        cc = c.drop_duplicates("id").set_index("id")
        jj = j.astype(object).drop_duplicates("id").set_index("id")
        common = cc.index.intersection(jj.index)
        diffs = {}
        for col in cols:
            if col not in cc.columns:
                continue
            a = cc.loc[common, col]
            b = jj.loc[common, col]
            if any(h in col for h in NUM_HINT):
                na, nb = a.map(parse_num), b.map(parse_num)
                d = ~((na - nb).abs() < 1e-6) & ~(na.isna() & nb.isna())
            else:
                d = a.map(lambda x: "" if is_empty(x) else str(x).strip()) != \
                    b.map(lambda x: "" if is_empty(x) else str(x).strip())
            if int(d.sum()):
                ex = list(zip(a[d].head(3), b[d].head(3)))
                diffs[col] = (int(d.sum()), ex)
        p(f"  CSV vs JSON (mesmo id): {diffs if diffs else 'iguais'}")
    for col, ref in FK.items():
        if col in j.columns:
            s = j[col].astype(str)
            orph = s[~s.isin(ref)]
            p(f"  ligacao {col}: {len(orph)} sem correspondencia; exemplos "
              f"{orph.value_counts().head(8).to_dict()}")
    for col in j.columns:
        vals = j[col].tolist()
        tm = Counter(typename(v) for v in vals)
        nnull = sum(1 for v in vals if is_empty(v))
        nun = j[col].astype(str).nunique()
        line = f"  - {col}: tipos {dict(tm)}; vazios {nnull}; distintos {nun}"
        if col in DATE_COLS:
            kinds = Counter(date_kind(v) for v in vals)
            parsed = pd.Series([parse_date(v) for v in vals])
            bad = int(parsed.isna().sum()) - nnull
            line += (f"; formatos {dict(kinds.most_common(8))}; "
                     f"min {parsed.min()} max {parsed.max()}; nao lidas {bad}")
            yrs = parsed.dt.year.value_counts().sort_index().to_dict()
            line += f"; por ano {yrs}"
        elif any(h in col for h in NUM_HINT):
            nums = pd.Series([parse_num(v) for v in vals])
            bad = sum(1 for v, n in zip(vals, nums) if np.isnan(n) and not is_empty(v))
            q1, q3 = nums.quantile(.25), nums.quantile(.75)
            iqr = q3 - q1
            hi = int((nums > q3 + 3 * iqr).sum())
            lo = int((nums < q1 - 3 * iqr).sum())
            line += (f"; min {nums.min():.2f} mediana {nums.median():.2f} "
                     f"max {nums.max():.2f} soma {nums.sum():.2f}; negativos {int((nums < 0).sum())}; "
                     f"zeros {int((nums == 0).sum())}; nao numericos {bad}; "
                     f"outliers 3xIQR {lo} abaixo {hi} acima")
        elif nun <= 40 and not col.startswith("id"):
            vc = j[col].astype(str).value_counts()
            line += "; valores " + ", ".join(f"{k}={v}" for k, v in vc.head(16).items())
            variants = Counter(norm_txt(k) for k in vc.index)
            multi = [k for k, n in variants.items() if n > 1]
            if multi:
                line += f"; ! grafias diferentes: {multi}"
        else:
            line += f"; exemplos {list(map(str, j[col].head(3)))}"
        p(line)

p("\n## Verificacoes especificas")
met = frames["metricas_impacto"][1].copy()
p("metrica x unidade:")
p(pd.crosstab(met["metrica"].astype(str), met["unidade"].astype(str)).to_string())
p("\nmetricas por projeto:")
p(met.groupby("id_projeto")["metrica"].apply(
    lambda s: ", ".join(sorted(set(map(str, s))))).to_string())
p("\nperiodos por projeto (min, max, n):")
met["dnum"] = met["periodo"].map(parse_date)
p(met.groupby("id_projeto")["dnum"].agg(["min", "max", "count"]).to_string())

dep = frames["despesas_projeto"][1].copy()
dep["vnum"] = dep["valor"].map(parse_num)
neg = dep[dep["vnum"] < 0]
p(f"\ndespesas negativas: {len(neg)}; soma {neg['vnum'].sum():.2f}; "
  f"descricoes {neg['descricao_curta'].astype(str).value_counts().head(8).to_dict()}")
pos = dep[dep["vnum"] > 0]
keys = set(zip(pos["id_projeto"].astype(str), pos["vnum"].round(2)))
matched = sum((str(r.id_projeto), round(-r.vnum, 2)) in keys for r in neg.itertuples())
p(f"negativos com um positivo de igual valor no mesmo projeto: {matched} de {len(neg)}")
p("categorias:", dep["categoria"].astype(str).value_counts().to_dict())
p("descricoes:", dep["descricao_curta"].astype(str).value_counts().head(20).to_dict())

al = frames["alocacoes_voluntarios"][1].copy()
di = al["data_inicio"].map(parse_date)
dfim = al["data_fim"].map(parse_date)
p(f"\nalocacoes com fim antes do inicio: {int((dfim < di).sum())}; sem fim: {int(dfim.isna().sum())}")

pr = frames["projetos"][1]
p("\nprojetos:")
p(pr.to_string())
pl = frames["parceiros_locais"][1]
p("\nparceiros:")
p(pl.to_string())

print("\n".join(out))
