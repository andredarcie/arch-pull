# ArchPull

![ArchPull banner](./public/banner.svg)

ArchPull is a daily learning app for developers who already know how to code but want to deepen their technical judgment in software architecture, best practices, design patterns, clean code, clean architecture, distributed systems, and DevOps.

The goal is not to recreate long-form courses, heavy reading, or passive video consumption. The product is designed to turn deep technical knowledge into a lightweight, fast, repeatable experience that feels closer to a daily habit than a traditional learning platform.

## Table of Contents

- [Product Vision](#product-vision)
- [Current Core Mechanics](#current-core-mechanics)
- [Product Direction](#product-direction)
- [Current Stack](#current-stack)
- [Repository Architecture](#repository-architecture)
- [What Is Already Implemented](#what-is-already-implemented)
- [Planned Features](#planned-features)
- [Prerequisites](#prerequisites)
- [Running the Project](#running-the-project)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [GitHub Login](#github-login)
- [Database](#database)
- [Quality and Maintenance](#quality-and-maintenance)
- [License](#license)

## Product Vision

ArchPull is built for mid-level and senior developers who:

- already ship software in real projects
- want to improve engineering judgment
- do not want long passive content
- prefer short, high-frequency learning sessions

The core idea is simple:

- open the app every day
- complete one short technical activity
- reinforce knowledge through quick interaction
- build stronger architecture intuition over time

Instead of long videos or dense theory, the app focuses on:

- fast question-and-answer loops
- Tinder-style concept pairing and swipe decisions
- flashcards
- friend competition and global ranking
- GitHub login

The goal is for the user to spend only a few minutes per day, while still making steady progress in architecture and software engineering thinking.

## Current Core Mechanics

The current project uses a roadmap-based progression model with modules such as:

- Fundamentals
- Design Patterns
- SOLID and Clean Code
- Architectural Styles
- Microservices
- Distributed Systems
- Kafka
- Cloud and DevOps
- Observability
- Scalability
- Security
- Technical Leadership
- Object Calisthenics

Each module mixes:

- concept pairs where the user decides whether they match
- informational cards in flashcard format
- score tracking
- a final review screen with mistakes

## Product Direction

ArchPull is not trying to be a “Netflix for courses”.

It is meant to be:

- a daily technical routine
- a training ground for engineering judgment
- a short, practical, competitive learning experience

If Instagram or TikTok compete for a few minutes of attention every day, ArchPull aims to claim part of that same habit loop, but for real technical growth.

## Current Stack

### Frontend

- React 19
- TypeScript
- Vite
- Framer Motion

### Backend

- Vercel Functions
- TypeScript
- HTTP adapter layer in `api/`
- reusable business logic in `server/`

### Data and Authentication

- GitHub OAuth
- session cookies with `HttpOnly`
- Neon as the serverless PostgreSQL database
- Drizzle ORM for schema, queries, and migrations

## Repository Architecture

```text
/
  api/                # HTTP adapters for Vercel Functions
  server/             # auth, session, integrations, db and business logic
  src/                # React frontend
  drizzle.config.ts   # Drizzle config
  vercel.json         # Vercel config
```

This split is intentional:

- `api/` should stay thin and platform-facing
- `server/` should hold the reusable core logic

That reduces Vercel lock-in and makes future migration easier if needed.

## What Is Already Implemented

The repository already includes:

- the main swipe-based gameplay loop
- a roadmap of learning modules
- informational flashcards
- a final result screen with mistake review
- base GitHub auth flow through Vercel Functions
- session structure through cookies
- initial Drizzle + Neon schema
- initial authenticated progress sync

## Planned Features

The next natural product evolutions are:

- a daily challenge or topic of the day
- global leaderboard
- friend competition
- fully persistent progress per account
- module history
- stronger pedagogical feedback after each answer
- smarter flashcard reinforcement

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- [Vercel CLI](https://vercel.com/docs/cli) (only required for `dev:vercel`)

## Running the Project

### Frontend only

If you only want to work on the UI:

```bash
npm install
npm run dev
```

### Full app with local Vercel backend

To test auth and functions:

```bash
npm install
npm run dev:vercel
```

## Scripts

```bash
npm run dev
npm run dev:vercel
npm run build
npm run lint
npm run db:generate
npm run db:migrate
```

## Environment Variables

Create a `.env.local` file at the project root:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SESSION_SECRET=...
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
ADMIN_GITHUB_LOGINS=your-github-login
```

### What each variable does

- `GITHUB_CLIENT_ID`
  GitHub OAuth App client ID

- `GITHUB_CLIENT_SECRET`
  GitHub OAuth App client secret

- `SESSION_SECRET`
  secret used to sign the application session

- `APP_URL`
  base URL of the application

- `DATABASE_URL`
  Neon connection string

- `ADMIN_GITHUB_LOGINS`
  Comma-separated list of GitHub logins with access to the backoffice (e.g., `andrendarcie`)

## GitHub Login

The intended auth flow is:

1. the frontend redirects to `/api/auth/github`
2. GitHub authenticates the user
3. callback returns to `/api/auth/github-callback`
4. the app creates its own session
5. the frontend loads the current user through `/api/me`

Technical details and architecture decisions are documented in:

- [VERCEL_GITHUB_LOGIN_PLAN.md](./VERCEL_GITHUB_LOGIN_PLAN.md)

## Database

The chosen database is `Neon`, using serverless PostgreSQL.

The data access layer uses `Drizzle`.

Current schema direction:

- `users`
- `user_progress`
- `match_sessions`

## Quality and Maintenance

The technical improvement backlog is documented in:

- [IMPROVEMENTS.md](./IMPROVEMENTS.md)

That document tracks product, UX, accessibility, persistence, and architecture improvements.

## Brand Direction

The product name is `ArchPull` because it combines:

- software architecture
- a technical daily habit
- continuous improvement
- a stronger brand identity for developers

## Current Project Status

The repository is no longer a generic Vite starter. It now reflects a real product direction, but it is still evolving.

The current focus is to solidify:

- authentication
- persistence
- account-based progress
- the daily learning experience

## Local Validation

Before shipping changes:

```bash
npm run lint
npm run build
```

## License

All rights reserved. This project is not open for external contributions or redistribution at this time.
