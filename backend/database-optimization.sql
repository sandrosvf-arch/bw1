-- Script de Otimização de Performance do Banco de Dados
-- Execute este script no Supabase SQL Editor para melhorar drasticamente a performance

-- ============================================
-- ÍNDICES PARA TABELA DE LISTINGS
-- ============================================

-- Índice para buscas por status (usado em todas as listagens públicas)
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Índice para buscas por categoria
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);

-- Índice para buscas por tipo
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);

-- Índice para buscas por dealType
CREATE INDEX IF NOT EXISTS idx_listings_dealtype ON listings("dealType");

-- Índice composto para listagens ativas ordenadas por data (query mais comum)
CREATE INDEX IF NOT EXISTS idx_listings_active_date 
ON listings(status, created_at DESC);

-- Índice composto para filtros de categoria + status
CREATE INDEX IF NOT EXISTS idx_listings_category_status 
ON listings(category, status, created_at DESC);

-- Índice para buscas por user_id (meus anúncios)
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Índice para buscas textuais no título (apoio ao ilike)
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm 
ON listings USING gin (title gin_trgm_ops);

-- Ativar extensão necessária para full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ÍNDICES PARA TABELA DE CONVERSATIONS
-- ============================================

-- Índice para buscar conversas por user1_id
CREATE INDEX IF NOT EXISTS idx_conversations_user1 
ON conversations(user1_id, updated_at DESC);

-- Índice para buscar conversas por user2_id
CREATE INDEX IF NOT EXISTS idx_conversations_user2 
ON conversations(user2_id, updated_at DESC);

-- Índice para buscar por listing_id
CREATE INDEX IF NOT EXISTS idx_conversations_listing 
ON conversations(listing_id);

-- Índice composto para query de conversas do usuário
CREATE INDEX IF NOT EXISTS idx_conversations_users_updated 
ON conversations(user1_id, user2_id, updated_at DESC);

-- ============================================
-- ÍNDICES PARA TABELA DE MESSAGES
-- ============================================

-- Índice para buscar mensagens por conversa ordenadas por data
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date 
ON messages(conversation_id, created_at ASC);

-- Índice para buscar mensagens por remetente
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id);

-- ============================================
-- ÍNDICES PARA TABELA DE FAVORITES
-- ============================================

-- Índice composto para favoritos do usuário
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing 
ON favorites(user_id, listing_id);

-- Índice para buscar favoritos por listing
CREATE INDEX IF NOT EXISTS idx_favorites_listing 
ON favorites(listing_id);

-- ============================================
-- ÍNDICES PARA TABELA DE USERS
-- ============================================

-- Índice para buscas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- ANALYZE TABLES (Atualiza estatísticas)
-- ============================================

ANALYZE listings;
ANALYZE conversations;
ANALYZE messages;
ANALYZE favorites;
ANALYZE users;

-- ============================================
-- DICAS DE PERFORMANCE
-- ============================================

-- 1. Os índices melhoram leitura mas podem deixar escrita um pouco mais lenta
-- 2. Execute ANALYZE periodicamente (mensalmente) para manter estatísticas atualizadas
-- 3. Monitore queries lentas usando o Supabase Dashboard > Database > Query Performance
-- 4. Se uma query ainda estiver lenta, verifique se está usando os índices com EXPLAIN ANALYZE

-- Para verificar se os índices estão sendo usados:
-- EXPLAIN ANALYZE SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 20;
