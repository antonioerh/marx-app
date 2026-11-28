# brapi.py
import os
import time
import requests
from typing import Any

BASE = "https://brapi.dev/api"

TOKEN = os.getenv("BRAPI_API_KEY") or os.getenv("BRAPI_TOKEN")

class BrapiError(Exception):
    pass

session = requests.Session()
session.headers.update({
    "Accept": "application/json",
})
if TOKEN:
    session.headers["Authorization"] = f"Bearer {TOKEN}"

def get(path: str, retries: int = 3, **params) -> dict[str, Any]:
    url = f"{BASE}{path}"
    for attempt in range(retries):
        try:
            r = session.get(url, params=params, timeout=15)
        except requests.RequestException as e:
            if attempt == retries - 1:
                raise BrapiError(f"Falha de rede: {e}") from e
            time.sleep(2 ** attempt)
            continue

        if r.status_code == 429:
            time.sleep(2 ** attempt)
            continue
        if r.status_code in (401, 403):
            raise BrapiError(f"{r.status_code}: verifique o token e o plano ({r.text[:200]})")
        if r.status_code == 404:
            raise BrapiError(f"404: ativo ou rota não encontrado ({path})")
        if not r.ok:
            raise BrapiError(f"{r.status_code}: {r.text[:200]}")
        return r.json()

    raise BrapiError("Limite de requisições simultâneas atingido, tente de novo")

def cotacoes(symbols: list[str]) -> list[dict]:
    data = get("/v2/stocks/quote", symbols=",".join(symbols))
    return [
        {
            "symbol": item["symbol"],
            "nome": item["data"].get("shortName"),
            "preco": item["data"]["regularMarketPrice"],
            "variacao_pct": item["data"]["regularMarketChangePercent"],
        }
        for item in data["results"]
    ]

def historico(symbol: str, range_: str = "1y", interval: str = "1d") -> list[dict]:
    data = get("/v2/stocks/historical", symbols=symbol, range=range_, interval=interval)
    return data["results"][0]["data"]["historicalDataPrice"]

def dividendos(symbols: list[str], inicio: str | None = None, fim: str | None = None) -> list[dict]:
    params = {"symbols": ",".join(symbols)}
    if inicio: params["startDate"] = inicio
    if fim: params["endDate"] = fim
    data = get("/v2/stocks/dividends", **params)
    return data["results"][0]["data"]
