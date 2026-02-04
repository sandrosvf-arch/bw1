# BW1 Backend API

Backend API para a plataforma BW1 de anúncios de imóveis e veículos.

## 🚀 Stack

- **Node.js** + **Express** + **TypeScript**
- **Supabase** (PostgreSQL + Auth + Storage)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## 📦 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no `.env`

3. Configure o Supabase (próximo passo - veja instruções abaixo)

## 🗄️ Setup do Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Project Settings** > **API** e copie:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Cole no arquivo `.env`

### Criar Tabelas no Supabase

Vá em **SQL Editor** e execute:

```sql
-- Tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anúncios
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50),
  location VARCHAR(255) NOT NULL,
  images JSONB DEFAULT '[]',
  details JSONB DEFAULT '{}',
  contact JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Índices para performance
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

## 🔧 Desenvolvimento

```bash
npm run dev
```

Servidor rodará em `http://localhost:3001`

## 📚 Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual (autenticado)

### Anúncios
- `GET /api/listings` - Listar anúncios
- `GET /api/listings/:id` - Detalhes do anúncio
- `POST /api/listings` - Criar anúncio (autenticado)
- `PUT /api/listings/:id` - Atualizar anúncio (autenticado)
- `DELETE /api/listings/:id` - Deletar anúncio (autenticado)
- `GET /api/listings/user/my-listings` - Meus anúncios (autenticado)

### Chat
- `GET /api/chat/conversations` - Listar conversas (autenticado)
- `GET /api/chat/conversations/:id/messages` - Mensagens (autenticado)
- `POST /api/chat/conversations` - Criar conversa (autenticado)
- `POST /api/chat/messages` - Enviar mensagem (autenticado)

### Usuários
- `GET /api/users/:id` - Perfil público
- `PUT /api/users/profile` - Atualizar perfil (autenticado)
- `GET /api/users/favorites` - Favoritos (autenticado)
- `POST /api/users/favorites/:listingId` - Adicionar favorito (autenticado)
- `DELETE /api/users/favorites/:listingId` - Remover favorito (autenticado)

## 🚢 Deploy

### Railway
1. Conecte seu repositório no [Railway](https://railway.app)
2. Configure as variáveis de ambiente
3. Deploy automático

### Render
1. Conecte seu repositório no [Render](https://render.com)
2. Configure as variáveis de ambiente
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && npm start`

## 📝 Licença

MIT
