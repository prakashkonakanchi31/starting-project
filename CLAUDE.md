# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We are building an app described in @SPEC.md. Read that file for general architectural tasks or to double check the exact databas structure, tech stack or application architecture.

Keep yoour replies extremely concise and focus only on conveying key information. No unnecessary fluff, no long code snippets.

Whenever working with any third party libraries or somethign similar, you MUST look up the official documentation to ensure you are working with up-to-date information. Use the DocsExplorer subagent for efficient documentation look up.

## Project state

This repo is a Next.js starter (`create-next-app`) with the package name `claude-code`. The actual current code (`app/page.tsx`, `app/lib/cities.ts`) is a small "World Clock" demo — a form where a user types a city name, validated/looked up against a curated `CITY_TIMEZONES` map in `app/lib/cities.ts`, that renders a live analog SVG clock for that city's timezone.

`SPEC.md` describes a *separate, unbuilt* target application — a rich-text note-taking app (auth via better-auth, TipTap editor, SQLite via Bun, public note sharing at `/p/[slug]`). None of that (auth, DB layer, notes API, TipTap) exists in the code yet. Treat `SPEC.md` as the spec to build toward, not a description of current architecture — check `app/` directly before assuming any note-related file, route, or table exists.

## Commands

Package manager is **bun** (`bun.lock` present).

- `bun run dev` — start dev server (Next.js App Router, http://localhost:3000)
- `bun run build` — production build
- `bun run lint` — ESLint (flat config, `eslint-config-next`)
- `bun run test` — run tests via **Vitest** (this is the canonical test runner)
- `bun run test:watch` — Vitest watch mode
- `bun run test:coverage` — Vitest with istanbul coverage
- Single test file: `bun run test app/__tests__/cities.test.ts`
- Single test by name: `bun run test -t "test name pattern"`

Note: `jest.config.ts` / `jest.setup.ts` also exist in the repo alongside the Vitest config, but `package.json`'s `test` script only invokes Vitest — don't assume Jest is wired into any workflow unless you check for a caller of it first.

## Architecture notes

- App Router under `app/`; path alias `@/*` maps to the repo root (see `tsconfig.json`).
- Client-side logic vs. presentation is split: pure validation/data helpers live in `app/lib/*.ts` (no React), consumed by `"use client"` components in `app/*.tsx`. Follow this split for new features — keep parseable/testable logic out of components.
- Tests live in `app/__tests__/` and target both `app/lib/*.ts` helpers and component/page rendering (`@testing-library/react` + jsdom). `vitest.setup.ts` mocks `next/font/google` globally — needed for any test that imports `app/layout.tsx`.
- Styling is TailwindCSS v4 (`@tailwindcss/postcss` in `postcss.config.mjs`); no `tailwind.config.ts` — v4 config is CSS-based in `app/globals.css`.
- `.env` / `.env.example` already anticipate the `SPEC.md` app (`BETTER_AUTH_SECRET`, `DB_PATH=data/app.db`) even though better-auth and the SQLite layer aren't implemented yet.
