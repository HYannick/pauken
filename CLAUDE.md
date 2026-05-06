# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pauken** is a PWA flashcard app for learning German A1 vocabulary. It runs fully offline after first load and is built with Vue 3 + Vite + Tailwind CSS v4.

## Commands

```bash
pnpm dev        # Dev server at http://localhost:5173
pnpm build      # Type-check + bundle (output: dist/)
pnpm preview    # Serve dist/ locally
```

No test runner is configured. Type checking runs automatically as part of `build` via `vue-tsc`.

## Architecture

### Data flow

`data.ts` defines all vocabulary (4 modules: Articles, Countries, Irregular Verbs, Plurals) and game constants (5 hearts, 10 XP/correct answer, 50 XP session bonus).

`types.ts` defines the shared TypeScript interfaces used across the app.

### State management

Three composables handle all logic — no Vuex/Pinia:

- **`useStorage`** — reads/writes `AppStats` and `WordStatsMap` to localStorage.
- **`useGame`** — pure utilities: shuffle, `buildCard`, `buildDeck`, option styling.
- **`useGameSession`** — reactive game state (deck, current card index, hearts, score, streak, animations). The deck is built by prioritizing hard cards → medium → fresh → easy.

### Views

- `HomeView` — module selection with global XP progress and per-module weak-area indicators.
- `GameView` — game loop: multiple-choice question, hearts bar, feedback animations.
- `StatsView` — cumulative stats per module; exposes a reset function.

`App.vue` drives view switching (no router library); the active view is a `ref<'home' | 'game' | 'stats'>`.

### Styling

Tailwind CSS v4 is loaded via `@tailwindcss/vite`. Custom animations (shake, bounce-card, card-in, fade-up, screen-in) are defined in `src/style.css`.

### PWA

`vite-plugin-pwa` generates a Workbox service worker that caches all assets and Google Fonts (CacheFirst, 1-year TTL). HTTPS is required in production for the service worker to register.