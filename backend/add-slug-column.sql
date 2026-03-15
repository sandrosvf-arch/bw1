-- Adiciona coluna slug na tabela listings
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug TEXT;

-- Cria índice único para buscas rápidas por slug
CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_unique ON listings(slug) WHERE slug IS NOT NULL;

-- Depois de rodar, execute o script populate-slugs.js para gerar slugs para anúncios existentes
