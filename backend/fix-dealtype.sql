-- Migração para adicionar coluna dealType à tabela listings
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna dealType se não existir
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS "dealType" TEXT;

-- 2. Atualizar registros existentes que não têm dealType definido
UPDATE listings 
SET "dealType" = 'Venda' 
WHERE "dealType" IS NULL;

-- 3. Verificar os dados atualizados
SELECT id, title, category, type, "dealType", status 
FROM listings 
ORDER BY created_at DESC 
LIMIT 10;
