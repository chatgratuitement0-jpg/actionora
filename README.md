# Actionora

Actionora is a client-action intelligence platform built around one question:

> **What needs my attention now?**

## Stack

- Next.js 16.3
- React 19.2
- TypeScript
- Tailwind CSS 4
- Supabase Auth / PostgreSQL / Storage
- GitHub

## Development

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase publishable key.
3. Install dependencies with `npm install`.
4. Start with `npm run dev`.

Never commit secrets. The browser must only receive the Supabase publishable key; server-only secrets belong in deployment environment variables.