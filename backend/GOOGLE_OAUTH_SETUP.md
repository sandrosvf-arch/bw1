# Configuração do Google OAuth

## Passo 1: Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth Client ID**
5. Configure a tela de consentimento OAuth se ainda não fez:
   - User Type: External
   - App name: BW1 - Carros e Imóveis
   - User support email: seu-email@gmail.com
   - Developer contact: seu-email@gmail.com

## Passo 2: Criar OAuth Client ID

1. Application type: **Web application**
2. Name: BW1 OAuth Client
3. **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://localhost:3001`
   - `https://bw1imoveis.com.br`
   
4. **Authorized redirect URIs:**
   - `http://localhost:3001/auth/google/callback`
   - `https://api.bw1imoveis.com.br/auth/google/callback`

5. Clique em **Create**
6. Copie o **Client ID** e **Client Secret**

## Passo 3: Configurar Backend

Edite o arquivo `backend/.env`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

## Passo 4: Reiniciar Backend

```bash
cd backend
npm run build
npm start
```

## Testando

1. Acesse a página de login: `http://localhost:5173/login`
2. Clique em "Continuar com Google"
3. Será redirecionado para o Google para autorização
4. Após autorizar, retornará para a aplicação já autenticado

## Notas

- Os usuários que fizerem login com Google terão a senha vazia no banco
- O avatar do Google será automaticamente salvo no perfil
- Se o email já existir, o sistema atualiza o avatar e autentica o usuário existente
