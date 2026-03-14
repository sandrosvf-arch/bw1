-- Migração: adiciona coluna bumped_at e bumps_remaining em listings
-- Execute este SQL no painel SQL do Supabase

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bumps_remaining INTEGER DEFAULT 0;

-- Concede bumps iniciais a anúncios já pagos
UPDATE listings
SET bumps_remaining = CASE
  WHEN plan = 'standard' THEN 3
  WHEN plan = 'pro'      THEN 5
  WHEN plan = 'premium'  THEN 99
  ELSE 0
END
WHERE plan IS NOT NULL AND plan != 'basic';

-- Índice para melhorar performance da ordenação
CREATE INDEX IF NOT EXISTS idx_listings_featured_bumped
  ON listings (featured DESC, bumped_at DESC NULLS LAST, created_at DESC);
