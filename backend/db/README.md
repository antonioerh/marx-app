# Banco local do Marx App (SQLite)

O banco roda num arquivo local, sem servidor, senha ou mensalidade. Esta etapa
não conecta o Express ao banco, não implementa login e não cria rotas do dashboard.

## Criar uma cópia

Com Node.js 24, na raiz do repo:

```powershell
node backend/db/init.js
```

Cria `backend/db/marx-demo.sqlite` com dados fictícios. Se já existir, o comando
não altera o arquivo. Use `node backend/db/init.js --empty` pra criar
`backend/db/marx-local.sqlite` com o mesmo esquema e sem dados. Os arquivos
SQLite ficam fora do Git; compartilhem os scripts, não o arquivo de banco.

Também dá para criar um arquivo novo no DBeaver: escolha SQLite, informe um
caminho novo e execute `schema.sql` e depois `001-users.sql` como scripts SQL. Opcionalmente, execute
`seed-demo.sql` uma única vez num banco vazio, em modo autocommit. Para
inspecionar o banco criado pelo Node, escolha SQLite e aponte para
`backend/db/marx-demo.sqlite` no campo **Path**.

## O que está salvo

- `wallets`: saldo inicial e saldo disponível.
- `assets`: ativos fictícios e seus preços de referência, que podem estar ausentes.
- `operations`: histórico de compra e venda por carteira.

Valores monetários são inteiros em **centavos**. As posições podem ser obtidas
do histórico; o banco não salva percentuais ou totais calculados pelo dashboard.
Quando o backend for integrado, mantenha as chaves estrangeiras habilitadas e
grave cada operação e a atualização do saldo na mesma transação.

A carteira `demo` tem 3 compras. A conferência esperada é saldo de **R$ 510**,
custo de **R$ 490**, posições a **R$ 500** e patrimônio de **R$ 1.010**.
Os dois tickers são fictícios, portanto a demo não depende da brapi.

## Usuário local de teste

O arquivo `001-users.sql` cria a tabela `users` (ou rode o inicializador para
um banco novo). Usuários têm um hash de senha, não senha em texto. O usuário
local de teste não é distribuído no seed nem nos arquivos versionados.
Ter um usuário no banco não equivale a ter autenticação: o Express ainda
precisa verificar a senha e criar uma sessão quando o login for implementado.
