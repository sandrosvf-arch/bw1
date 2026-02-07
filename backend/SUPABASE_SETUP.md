# Configuração do Supabase - BW1

## Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: BW1
   - **Database Password**: Crie uma senha forte (guarde ela!)
   - **Region**: South America (São Paulo) - mais próximo do Brasil
4. Clique em **"Create new project"** (leva ~2 minutos)

## Passo 2: Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: A chave pública (anon key)
   - **service_role**: A chave de serviço (somente backend, NUNCA exponha no frontend)

## Passo 3: Criar Tabelas

Execute os seguintes SQLs no **SQL Editor** do Supabase:

### 3.1 Tabela de Usuários

```sql
-- Criar tabela users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por email
CREATE INDEX idx_users_email ON users(email);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.2 Tabela de Anúncios

```sql
-- Criar tabela listings
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'vehicle' ou 'property'
  type VARCHAR(50), -- Para veículos: 'car', 'motorcycle', etc. Para imóveis: 'house', 'apartment', etc.
  location JSONB NOT NULL, -- { city, state, neighborhood, address }
  images TEXT[] DEFAULT '{}', -- Array de URLs das imagens
  details JSONB DEFAULT '{}', -- Detalhes específicos (ano, km, quartos, etc)
  contact JSONB DEFAULT '{}', -- { name, phone, email, whatsapp }
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'sold', 'inactive'
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar full-text search para título e descrição
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
```

### 3.3 Tabela de Favoritos

```sql
-- Criar tabela de favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Índices
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
```

### 3.4 Tabela de Conversas

```sql
-- Criar tabela de conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, listing_id)
);

-- Índices
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_listing ON conversations(listing_id);
```

### 3.5 Tabela de Mensagens

```sql
-- Criar tabela de mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

## Passo 4: Configurar Políticas de Segurança (RLS)

```sql
-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para listings (anúncios públicos para leitura)
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (true);

-- Políticas para favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (true);

-- Políticas para conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (true);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Políticas para messages
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (true);
```

## Passo 5: Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
FRONTEND_PROD_URL=https://bw1.com.br
```

## Passo 6: Configurar Storage para Imagens (Opcional)

1. No Supabase, vá em **Storage**
2. Crie um novo bucket chamado `listings-images`
3. Configure como **público**
4. Configure políticas de upload (apenas usuários autenticados)

## Passo 7: Testar

1. Reinicie o backend: `npm run dev`
2. Teste o endpoint de health: http://localhost:3001/health
3. Faça login e teste criar um anúncio

## Variáveis de Ambiente para Produção (Render)

No Render, adicione as mesmas variáveis de ambiente na configuração do serviço.
