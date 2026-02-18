# Instruções do Copilot para a Base de Código BW1

## Visão Geral
BW1 é uma plataforma full-stack para anúncios de imóveis e veículos. Consiste em um frontend React + Vite e um backend Node.js/Express/TypeScript, integrado com Supabase para banco de dados, autenticação e armazenamento.

## Arquitetura
- **Frontend**: Localizado em `src/`, utiliza componentes React, hooks e context. As páginas são organizadas por domínio (ex: `pages/bw1/`). Tailwind CSS é usado para estilização.
- **Backend**: Localizado em `backend/`, utiliza rotas Express, middlewares e serviços. TypeScript é usado para segurança de tipos. Supabase gerencia banco de dados e autenticação.
- **Integração**: Chamadas de API do frontend são feitas via `services/api.js` para endpoints do backend. Fluxos de autenticação usam JWT e Supabase.

## Fluxos de Trabalho do Desenvolvedor
- **Frontend**:
  - Iniciar servidor dev: `npm run dev` (raiz)
  - Build: `npm run build` (raiz)
  - Entrada principal: `src/main.jsx`, Shell da aplicação: `src/pages/bw1/components/AppShell.jsx`
- **Backend**:
  - Instalar dependências: `cd backend && npm install`
  - Iniciar servidor: `npm run dev` ou `npm start` (backend)
  - Configurar env: Copiar `.env.example` para `.env` e definir chaves do Supabase
  - Scripts de teste: Veja `backend/test.js`, `backend/test-create-listing.js`

## Padrões e Convenções
- **Rotas**: Rotas do backend em `backend/src/routes/`. Páginas do frontend em `src/pages/bw1/`.
- **Autenticação**: Usa JWT, Supabase e Google OAuth (`backend/src/config/passport.ts`, `backend/src/routes/google-auth.routes.ts`).
- **Dados**: Anúncios (listings) e usuários são as entidades principais. Veja `backend/src/routes/listings.routes.ts` e `backend/src/routes/users.routes.ts`.
- **Estilização**: Configuração do Tailwind em `tailwind.config.js`. Use classes utilitárias no JSX.
- **API**: Frontend chama backend via `services/api.js`. Use async/await e trate erros com try/catch.

## Dependências Externas
- **Supabase**: Configuração necessária, veja `backend/SUPABASE_SETUP.md`.
- **Google OAuth**: Veja `backend/GOOGLE_OAUTH_SETUP.md`.
- **Vite**: Para build do frontend e servidor de desenvolvimento.

## Exemplos
- Para adicionar um novo anúncio: Implementar em `backend/src/routes/listings.routes.ts` e chamar de `src/pages/bw1/CreateListingPage.jsx`.
- Para adicionar uma nova página: Criar em `src/pages/bw1/`, adicionar rota em `AppShell.jsx`.

## Referências
- Configuração principal do backend: `backend/src/config/supabase.ts`, `backend/src/config/passport.ts`
- Entrada principal do frontend: `src/main.jsx`, `src/pages/bw1/components/AppShell.jsx`
- Serviço de API: `src/services/api.js`

---
Para mais detalhes, veja os arquivos `README.md` na raiz e no backend. Atualize este arquivo se ocorrerem mudanças importantes na arquitetura ou nos fluxos de trabalho.