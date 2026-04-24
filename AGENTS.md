# AGENTS.md

Guidelines for AI agents working on the **dev-match** codebase.

## Project overview

A React + TypeScript flashcard game where users match software architecture concepts by swiping cards. Players progress through a roadmap of nodes (modules), each requiring ≥ 70 % correct answers to unlock the next level.

## Tech stack

- **Frontend**: React 18, TypeScript, Framer Motion
- **State**: local component state (`useState`) — no global store
- **Persistence**: `localStorage` for anonymous users; `/api/progress` for authenticated users
- **Auth**: GitHub OAuth — session handled server-side, surfaced via `/api/me`
- **Build**: Vite

## Repository layout

```
src/
  config.ts              # tunable constants (questionsPerModule, passThreshold, storageKey)
  auth.ts                # AuthState / AuthUser types
  App.tsx                # screen router and top-level state
  data/
    pairs.ts             # Card / Pair types, base pairs, getShuffledPairs()
    roadmap.ts           # RoadmapNode type, roadmapNodes[], getShuffledNodePairs(), getNodeById()
  components/
    StartScreen.tsx      # landing screen with GitHub login
    RoadmapScreen.tsx    # node graph / progress overview
    SwipeCard.tsx        # swipe-left / swipe-right game mechanic
    ScoreScreen.tsx      # results and wrong-answer review
    BackofficeScreen.tsx # admin view (isAdmin gate)
  lib/
    authApi.ts           # fetchAuthState(), logout()
    progressApi.ts       # fetchProgressSnapshot(), saveProgressUpdate()
  hooks/
    useSwipe.ts          # drag/swipe gesture hook
```

## Coding conventions

- **Language**: TypeScript strict mode — no `any`, no type assertions unless unavoidable.
- **Comments**: English only. Write a comment only when the *why* is non-obvious.
- **No magic numbers**: all tunable values live in `src/config.ts`.
- **Imports**: use path aliases from `tsconfig.json`; prefer named exports.
- **Async**: always `void`-prefix floating promises; never ignore rejections silently.
- **No new abstractions** unless the task explicitly requires it.

## Data model

```ts
// pairs.ts
type InfoCard = { kind: "info"; front: string; back: string };
type Pair     = { a: string; b: string; match: boolean };
type Card     = InfoCard | Pair;

// roadmap.ts
interface RoadmapNode {
  id: string;
  title: string;
  icon: string;
  level: number;
  prerequisites: string[];
  pairs: Card[];
}
```

`isPair(card)` narrows `Card → Pair`. Info cards are shown but excluded from scoring.

## API surface (backend not in this repo)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/me` | Returns `AuthState` (JSON) |
| POST | `/api/auth/github` | Starts GitHub OAuth flow |
| POST | `/api/auth/logout` | Clears session |
| GET | `/api/progress` | Returns `ProgressSnapshot { completedNodeIds: string[] }` |
| POST | `/api/progress` | Accepts `{ nodeId, score, total, completed }`, returns updated `ProgressSnapshot` |

All requests use `credentials: "include"`.

## Adding a new roadmap node

1. Add a `RoadmapNode` entry to the `roadmapNodes` array in `src/data/roadmap.ts`.
2. Set `prerequisites` to the IDs of nodes that must be completed first.
3. Provide at least `config.questionsPerModule` (currently **9**) `Pair` entries in `pairs[]`.
4. Optionally prepend `InfoCard` entries to teach concepts before testing them.

## Adding a new screen

1. Add the screen name to the `Screen` union in `App.tsx`.
2. Create `src/components/<ScreenName>Screen.tsx`.
3. Add the render branch inside the `<AnimatePresence>` block in `App.tsx`.

## What agents should NOT do

- Do not bypass the `isPair` filter when computing scores — info cards must be excluded.
- Do not store secrets or credentials in source files.
- Do not introduce a global state library (Redux, Zustand, etc.) without explicit user approval.
- Do not rename `storageKey` in `config.ts` without a migration plan — it would orphan existing user progress.
- Do not push directly to `main`; always confirm with the user before pushing.
