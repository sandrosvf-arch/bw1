# Copilot Instructions for BW1 Codebase

## Overview
BW1 is a full-stack platform for real estate and vehicle listings. It consists of a React + Vite frontend and a Node.js/Express/TypeScript backend, integrated with Supabase for database, authentication, and storage.

## Architecture
- **Frontend**: Located in `src/`, uses React components, hooks, and context. Pages are organized by domain (e.g., `pages/bw1/`). Tailwind CSS is used for styling.
- **Backend**: Located in `backend/`, uses Express routes, middleware, and services. TypeScript is used for type safety. Supabase handles database and auth.
- **Integration**: API calls from frontend are made via `services/api.js` to backend endpoints. Auth flows use JWT and Supabase.

## Developer Workflows
- **Frontend**:
  - Start dev server: `npm run dev` (root)
  - Build: `npm run build` (root)
  - Main entry: `src/main.jsx`, App shell: `src/pages/bw1/components/AppShell.jsx`
- **Backend**:
  - Install deps: `cd backend && npm install`
  - Start server: `npm run dev` or `npm start` (backend)
  - Configure env: Copy `.env.example` to `.env` and set Supabase keys
  - Test scripts: See `backend/test.js`, `backend/test-create-listing.js`

## Patterns & Conventions
- **Routes**: Backend routes in `backend/src/routes/`. Frontend pages in `src/pages/bw1/`.
- **Auth**: Uses JWT, Supabase, and Google OAuth (`backend/src/config/passport.ts`, `backend/src/routes/google-auth.routes.ts`).
- **Data**: Listings and users are main entities. See `backend/src/routes/listings.routes.ts` and `backend/src/routes/users.routes.ts`.
- **Styling**: Tailwind config in `tailwind.config.js`. Use utility classes in JSX.
- **API**: Frontend calls backend via `services/api.js`. Use async/await and handle errors with try/catch.

## External Dependencies
- **Supabase**: Setup required, see `backend/SUPABASE_SETUP.md`.
- **Google OAuth**: See `backend/GOOGLE_OAUTH_SETUP.md`.
- **Vite**: For frontend build and dev server.

## Examples
- To add a new listing: Implement in `backend/src/routes/listings.routes.ts` and call from `src/pages/bw1/CreateListingPage.jsx`.
- To add a new page: Create in `src/pages/bw1/`, add route in `AppShell.jsx`.

## References
- Main backend config: `backend/src/config/supabase.ts`, `backend/src/config/passport.ts`
- Main frontend entry: `src/main.jsx`, `src/pages/bw1/components/AppShell.jsx`
- API service: `src/services/api.js`

---
For more details, see `README.md` files in root and backend. Update this file if major architecture or workflow changes occur.