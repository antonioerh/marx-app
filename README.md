# Marx App

## Rodar o projeto localmente

Com Node.js 24+, na raiz do repositório:

```powershell
npm run setup  # instala as dependências do backend e do frontend
npm run dev    # inicializa o SQLite, se necessário, e sobe os dois servidores
npm run test   # roda os testes do backend e do frontend
```

No PowerShell, use `npm.cmd` no lugar de `npm` se a política de execução
bloquear o script do npm. Use Ctrl+C para parar os dois servidores.

- Frontend: http://127.0.0.1:5173/ e protótipo em http://127.0.0.1:5173/login.
- API: http://127.0.0.1:3000/health, ou a porta configurada no seu `.env`.
- Banco: `backend/db/marx-demo.sqlite`; `npm run db:init` cria o banco sem iniciar servidores. Um banco existente não é alterado.

`npm run dev:frontend`, `npm run dev:backend` e `npm run build` também
estão disponíveis. Para usar outra porta no frontend, defina `FRONTEND_PORT`.
O frontend e a API sobem juntos, mas o login ainda é visual e não consulta o banco.

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

Os tickers públicos de teste funcionam sem chave. Para outros ativos, defina `BRAPI_API_KEY` no arquivo `.env` da raiz (use `.env.example` como referência) ou na variável de ambiente do processo. O nome legado `API_KEY` também é aceito. A chave é lida somente pelo backend. Não inclua a chave no frontend, no Git ou em mensagens. Se usar o script de diagnóstico Python separado, forneça a chave pela variável de ambiente, não pelo código.

Referência: [documentação da brapi](https://brapi.dev/docs). Os preços fictícios do dashboard do MVP são independentes deste serviço.
