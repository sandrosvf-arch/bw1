-- Adicionar coluna auth_provider à tabela users
-- Esta coluna armazena o método de autenticação usado (google, email, etc)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';

-- Atualizar usuários existentes que têm email do Google
UPDATE users 
SET auth_provider = 'google' 
WHERE email LIKE '%@gmail.com' OR email LIKE '%@googlemail.com';

-- Comentário explicativo
COMMENT ON COLUMN users.auth_provider IS 'Método de autenticação: google, email, etc';
