# Marx App

## Backend de cotações (brapi)

Use o backend Node.js 22 ou mais recente. Na raiz do repositório:

```powershell
npm.cmd --prefix backend ci
npm.cmd --prefix backend test
npm.cmd --prefix backend start
```

O servidor local escuta em `http://127.0.0.1:3000` por padrão. Use `PORT` para outra porta, `HOST` se precisar escutar em outro endereço, e `CORS_ORIGINS` (origens exatas separadas por vírgula) para autorizar uma interface hospedada fora do localhost. Antes de expor as rotas na internet, proteja o acesso para evitar consumo indevido da cota da brapi.

```powershell
Invoke-RestMethod http://127.0.0.1:3000/health
Invoke-RestMethod 'http://127.0.0.1:3000/api/quotes?symbols=PETR4,VALE3'
Invoke-RestMethod 'http://127.0.0.1:3000/api/history/PETR4?range=1mo&interval=1d'
Invoke-RestMethod 'http://127.0.0.1:3000/api/dividends?symbols=PETR4'
```

A resposta preserva o formato da API v2, como `results[0].data.regularMarketPrice` para o preço. O histórico usa `1mo` e `1d` se omitidos. Dividendos aceitam `startDate` e `endDate` no formato AAAA-MM-DD. Os ativos, as janelas e o número de tickers disponíveis numa chamada dependem do plano da brapi.

Os tickers públicos de teste funcionam sem chave. Para outros ativos, defina `BRAPI_API_KEY` no arquivo `.env` da raiz (use `.env.example` como referência) ou na variável de ambiente do processo. A chave é lida somente pelo backend. Não inclua a chave no frontend, no Git ou em mensagens. Se usar o script de diagnóstico Python separado, forneça a chave pela variável de ambiente, não pelo código.

Referência: [documentação da brapi](https://brapi.dev/docs). Os preços fictícios do dashboard do MVP são independentes deste serviço.
