PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

INSERT INTO wallets (id, name, initial_cash_cents, cash_balance_cents)
VALUES ('demo', 'Carteira Demo', 100000, 51000);

INSERT INTO assets (ticker, name, reference_price_cents)
VALUES ('ATIVOA', 'Ativo A (fictício)', 2400),
       ('ATIVOB', 'Ativo B (fictício)', 3500);

INSERT INTO operations (id, wallet_id, ticker, side, quantity, unit_price_cents, executed_at)
VALUES ('demo-1', 'demo', 'ATIVOA', 'BUY', 10, 2000, '2026-01-05T13:00:00Z'),
       ('demo-2', 'demo', 'ATIVOA', 'BUY',  5, 2600, '2026-01-06T13:00:00Z'),
       ('demo-3', 'demo', 'ATIVOB', 'BUY',  4, 4000, '2026-01-07T13:00:00Z');

COMMIT;
