# tRPC React monorepo

A Bun-workspaces monorepo with a standalone tRPC API and a React + TypeScript frontend.

## Getting started

```sh
bun install
bun run dev
```

The frontend runs at [http://localhost:5174](http://localhost:5174) and the API at [http://localhost:3001](http://localhost:3001). The frontend calls the API through the Vite `/trpc` development proxy.

## Structure

- `frontend/` - Vite, React, TypeScript, Tailwind CSS and shadcn/ui configuration
- `backend/` - standalone Fastify server with tRPC

The backend can also be started by itself with `bun --cwd=backend run dev`.

Supabase credentials for the Vite app are read from `frontend/.env`; the backend reads `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from `backend/.env` to validate signed-in users. Both use the same project URL and publishable key. The key is intended for browser use; protect data with Supabase Auth and Row Level Security policies.

The backend's Drizzle client reads `DATABASE_URL` from `backend/.env`. Define table schemas in `backend/src/db/schema.ts`, generate migrations with `bun --cwd=backend run db:generate`, then apply them with `bun --cwd=backend run db:migrate`.
