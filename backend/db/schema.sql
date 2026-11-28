PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    initial_cash_cents INTEGER NOT NULL CHECK (initial_cash_cents >= 0),
    cash_balance_cents INTEGER NOT NULL CHECK (cash_balance_cents >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS assets (
    ticker TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    reference_price_cents INTEGER CHECK (reference_price_cents >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY NOT NULL,
    wallet_id TEXT NOT NULL REFERENCES wallets (id),
    ticker TEXT NOT NULL REFERENCES assets (ticker),
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0),
    executed_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_operations_wallet_time
    ON operations (wallet_id, executed_at, id);

COMMIT;
