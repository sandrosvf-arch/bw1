-- Execução no Supabase SQL Editor
-- Adiciona campos de plano na tabela listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Cria tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id           TEXT PRIMARY KEY,
  listing_id   UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  plan         TEXT NOT NULL,
  amount       NUMERIC(10,2) NOT NULL,
  status       TEXT DEFAULT 'pending',   -- pending | approved | rejected | cancelled
  mp_payment_id TEXT,
  qr_code      TEXT,
  qr_code_base64 TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  paid_at      TIMESTAMPTZ
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_payments_listing_id ON payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_payments_mp_payment_id ON payments(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_plan ON listings(plan);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
