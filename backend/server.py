from api import cotacoes, historico

for a in cotacoes(["PETR4", "VALE3", "ITUB4"]):
    print(f"{a['symbol']:6} R$ {a['preco']:.2f}  {a['variacao_pct']:+.2f}%")

candles = historico("PETR4", range_="1mo")
print(len(candles), "candles")
