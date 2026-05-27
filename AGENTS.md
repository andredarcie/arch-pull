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
    dailyThemeFallback.ts # tema local usado quando /api/theme falha
  components/
    StartScreen.tsx      # tela inicial com botão de entrar
    CalendarScreen.tsx   # calendário de atividade + tema do dia
    SwipeCard.tsx        # mecânica de swipe (par ou flashcard)
    ScoreScreen.tsx      # resultado e revisão de erros
    BackofficeScreen.tsx # admin view (isAdmin gate)
    CodeBlock.tsx        # syntax highlighting via react-syntax-highlighter (PrismLight + vscDarkPlus)
    RichText.tsx         # parser de texto misto: prosa + blocos ```lang\n...\n```
  lib/
    authApi.ts           # fetchAuthState(), logout()
    progressApi.ts       # fetchProgressSnapshot(), saveProgressUpdate()
  hooks/
    useSwipe.ts          # drag/swipe gesture hook

content/
  themes/                # temas diários em JSON prontos para importar via backoffice
    YYYY-MM-DD-slug.json # convenção de nome de arquivo
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

## Temas diários (content/themes/)

Cada arquivo JSON representa um tema do dia e segue a interface `DailyThemeInput` do servidor:

```jsonc
{
  "date": "YYYY-MM-DD",
  "title": "Nome do tema",
  "description": "Subtítulo exibido na tela do calendário.",
  "cards": [
    // Flashcard informativo (leitura + virar)
    { "kind": "info", "position": 0, "front": "Pergunta", "back": "Resposta longa..." },

    // Par de conceitos (swipe sim/não)
    { "kind": "pair", "position": 1, "conceptA": "Conceito A", "conceptB": "Conceito B", "match": true }
  ]
}
```

**Regras de composição de um tema:**

- Cada regra/conceito deve ter exatamente **1 card `info`** seguido de **1 card `pair`** — não mais.
- Cada tema deve ter exatamente **6 pares** (12 cards no total). Esse valor foi validado pelo usuario: resulta em ~5 minutos de sessão, alinhado com o padrao de micro-aprendizado.
- O card de intro genérico (explicando o tema em si) deve ser omitido — a `description` do tema já cumpre esse papel na tela do calendário.
- Alternar pares `match: true` e `match: false` para evitar que o usuário entre em piloto automático.
- O campo `back` dos cards `info` suporta blocos de código com a sintaxe ` ```typescript\n...\n``` ` (renderizados pelo componente `RichText` com syntax highlighting).
- O campo `position` deve ser sequencial a partir de 0.
- O campo `context.origin` e `context.motivation` existem no JSON mas **nao sao exibidos** — apenas `context.relevance` ("Por que preciso saber") é mostrado ao usuario antes de comecar. Preencher apenas `relevance` é suficiente.

**Ordem de corte ao reduzir um tema para 6 pares:**

1. Cards que repetem o mesmo exemplo já visto em outro card.
2. Cards de aplicacao avancada fora do escopo do tema principal.
3. Antipadroes cujo conceito já está implícito em outro card.

## UI e legibilidade

- **Ícones**: usar exclusivamente `lucide-react`. Nunca usar emojis na interface.
- **Tipografia**: fonte base 16 px, `line-height: 1.6`. Textos secundários em `var(--text-secondary)`.
- **Barra de progresso**: linha de 3 px no rodapé da tela de jogo (`game-progress-bar`), animada pelo Framer Motion, mostra `currentIndex / cards.length`.
- **Calendário**: exibe apenas os **3 últimos meses** (mês atual + 2 anteriores), não o ano inteiro.
- **Flashcard — face de resposta**: layout em três zonas fixas — label no topo, área de texto com scroll (`flashcard-answer-wrap`), botão "Continuar" preso no rodapé. Altura via `clamp(340px, calc(100dvh - 185px), 560px)`.

## What agents should NOT do

- Do not bypass the `isPair` filter when computing scores — info cards must be excluded.
- Do not store secrets or credentials in source files.
- Do not introduce a global state library (Redux, Zustand, etc.) without explicit user approval.
- Do not rename `storageKey` in `config.ts` without a migration plan — it would orphan existing user progress.
- Do not push directly to `main`; always confirm with the user before pushing.
