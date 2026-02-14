-- Índices para otimizar as queries de listagens

-- Índice para busca por status e tipo (mais comum)
CREATE INDEX IF NOT EXISTS idx_listings_status_type ON listings(status, type);

-- Índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Índice composto para queries mais complexas
CREATE INDEX IF NOT EXISTS idx_listings_status_type_created ON listings(status, type, created_at DESC);

-- Índice para busca de texto em título e descrição (usando GIN para ILIKE)
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm ON listings USING gin(description gin_trgm_ops);

-- Ativar extensão pg_trgm se ainda não estiver ativa (necessária para índices de texto)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice para user_id (para buscar anúncios do usuário)
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Análise da tabela para otimizar o planejador de queries
ANALYZE listings;
