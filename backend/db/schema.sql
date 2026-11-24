CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome     TEXT NOT NULL,
  tipo     TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  tipo            TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor_centavos  INTEGER NOT NULL CHECK (valor_centavos > 0),
  data            DATE NOT NULL,
  descricao       TEXT NOT NULL DEFAULT '',
  pago            BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_data ON transactions(user_id, data);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

CREATE TABLE IF NOT EXISTS settings (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  limite_mensal_centavos  INTEGER NOT NULL DEFAULT 0
);