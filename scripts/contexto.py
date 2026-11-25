"""Dados do mundo para a Lupa: indicadores do Banco Mundial (WDI) para os 12 países dos projetos.

Uso: python3 scripts/contexto.py
  - guarda as respostas em bruto em data/raw/contexto/
  - escreve public/data/contexto.json (tipo Contexto, docs/PLANO-V2.md, secção 6)
  - imprime o perfil: vazios por país e indicador, e valores com mais de 5 anos

Só a biblioteca padrão. Não inventa valores: o que faltar fica null.
"""

import json
import sys
import time
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BRUTO = RAIZ / "data" / "raw" / "contexto"
SAIDA = RAIZ / "public" / "data" / "contexto.json"
API = "https://api.worldbank.org/v2"
FONTE = "Banco Mundial, WDI"
FONTE_ARQUIVADO = "Banco Mundial, WDI: indicador arquivado, sem valor na API"
ANO_REFERENCIA = 2025  # a data de referência dos dados é 27/12/2025 (lib/dates.ts)
ANOS_ANTIGO = 5

# ISO3 → o nome do país em public/data/projetos.json, e a região da Lupa
PAISES = {
    "BRA": ("Brasil", "América do Sul"),
    "KEN": ("Quenia", "África"),
    "IND": ("India", "Ásia"),
    "PRT": ("Portugal", "Europa"),
    "GHA": ("Ghana", "África"),
    "PER": ("Peru", "América do Sul"),
    "SEN": ("Senegal", "África"),
    "BGD": ("Bangladesh", "Ásia"),
    "COL": ("Colombia", "América do Sul"),
    "PHL": ("Filipinas", "Ásia"),
    "UGA": ("Uganda", "África"),
    "MOZ": ("Mocambique", "África"),
}

# docs/PLANO-V2.md, tabela 2.3
INDICADORES = [
    "SE.LPV.PRIM",
    "SL.UEM.NEET.ZS",
    "SH.UHC.SRVS.CV.XD",
    "IT.NET.USER.ZS",
    "SI.POV.DDAY",
    "SE.PRM.CMPT.ZS",
    "SL.UEM.1524.ZS",
    "PA.NUS.PPPC.RF",
    "SP.POP.TOTL",
]


def obter(url: str, ficheiro: Path):
    """Descarrega um JSON da API, guarda-o em bruto e devolve-o. Tenta 3 vezes."""
    for tentativa in range(3):
        try:
            pedido = urllib.request.Request(url, headers={"User-Agent": "lupa-contexto/1.0"})
            with urllib.request.urlopen(pedido, timeout=60) as resposta:
                texto = resposta.read().decode("utf-8")
            ficheiro.write_text(texto, encoding="utf-8")
            return json.loads(texto)
        except Exception as erro:  # noqa: BLE001 — rede: tenta outra vez e falha no fim
            if tentativa == 2:
                raise RuntimeError(f"Falhou {url}: {erro}") from erro
            time.sleep(2 * (tentativa + 1))


def main() -> int:
    BRUTO.mkdir(parents=True, exist_ok=True)
    isos = ";".join(PAISES)

    # a capital e as coordenadas vêm da própria API (/country)
    paises_api = obter(f"{API}/country/{isos}?format=json&per_page=50", BRUTO / "paises.json")
    capitais = {
        p["id"]: {
            "capital": p["capitalCity"],
            "lat": float(p["latitude"]) if p["latitude"] else None,
            "lng": float(p["longitude"]) if p["longitude"] else None,
        }
        for p in paises_api[1]
    }

    valores: dict[str, dict[str, dict]] = {iso: {} for iso in PAISES}
    arquivados: list[str] = []
    for codigo in INDICADORES:
        url = f"{API}/country/{isos}/indicator/{codigo}?format=json&mrv=10&per_page=500"
        resposta = obter(url, BRUTO / f"{codigo}.json")
        fonte = FONTE
        if len(resposta) == 1 and "message" in resposta[0]:
            # o Banco Mundial passou o indicador para o arquivo do WDI: a API já não o devolve.
            # Fica null, com o motivo na fonte (não se inventam valores).
            fonte = FONTE_ARQUIVADO
            arquivados.append(codigo)
        linhas = resposta[1] if len(resposta) > 1 and resposta[1] else []
        for iso in PAISES:
            # o valor não nulo mais recente de cada país, com o ano
            doPais = [
                l for l in linhas if l["countryiso3code"] == iso and l["value"] is not None
            ]
            doPais.sort(key=lambda l: int(l["date"]), reverse=True)
            if doPais:
                valores[iso][codigo] = {
                    "valor": doPais[0]["value"],
                    "ano": int(doPais[0]["date"]),
                    "fonte": fonte,
                }
            else:
                valores[iso][codigo] = {"valor": None, "ano": None, "fonte": fonte}

    contexto = [
        {
            "pais": nome,
            "iso3": iso,
            "regiao": regiao,
            "lat": capitais[iso]["lat"],
            "lng": capitais[iso]["lng"],
            "indicadores": valores[iso],
        }
        for iso, (nome, regiao) in PAISES.items()
    ]
    SAIDA.write_text(json.dumps(contexto, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    # perfil (skill exploratory-data-analysis): vazios e frescura
    print("País × indicador: o ano do valor mais recente («—» = sem dado; * = mais de 5 anos)\n")
    cab = ["País"] + INDICADORES
    print(" | ".join(cab))
    print(" | ".join(["---"] * len(cab)))
    vazios = {c: 0 for c in INDICADORES}
    antigos = []
    for linha in contexto:
        celulas = [linha["pais"]]
        for c in INDICADORES:
            ano = linha["indicadores"][c]["ano"]
            if ano is None:
                vazios[c] += 1
                celulas.append("—")
            else:
                velho = ANO_REFERENCIA - ano > ANOS_ANTIGO
                if velho:
                    antigos.append((linha["pais"], c, ano))
                celulas.append(f"{ano}{'*' if velho else ''}")
        print(" | ".join(celulas))
    print("\nVazios por indicador (de 12 países):")
    for c, n in vazios.items():
        print(f"  {c}: {n} ({n / 12:.0%})")
    print(f"\nValores com mais de {ANOS_ANTIGO} anos (antes de {ANO_REFERENCIA - ANOS_ANTIGO}): {len(antigos)}")
    for pais, c, ano in antigos:
        print(f"  {pais} {c}: {ano}")
    print(f"\nIndicadores arquivados pelo Banco Mundial, sem valor na API: {arquivados or 'nenhum'}")
    sem_coord = [l["pais"] for l in contexto if l["lat"] is None or l["lng"] is None]
    print(f"\nPaíses sem coordenadas da capital: {sem_coord or 'nenhum'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
