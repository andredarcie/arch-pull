import type { Card, Source } from "../data/pairs";

export interface ThemeCard {
  kind: "pair" | "info";
  conceptA: string | null;
  conceptB: string | null;
  match: boolean | null;
  explanation: string | null;
  front: string | null;
  back: string | null;
}

export interface DailyTheme {
  date?: string;
  title: string;
  description: string | null;
  category?: ThemeCategory;
  context?: { relevance: string };
  sources?: Source[];
  cards: ThemeCard[];
}

export type ThemeCategory =
  | "solid-oop"
  | "design-patterns"
  | "architecture"
  | "quality-testing"
  | "ai-engineering"
  | "distributed-systems";

export const THEME_CATEGORY_LABELS: Record<ThemeCategory, string> = {
  "solid-oop": "SOLID & OOP",
  "design-patterns": "Design Patterns",
  "architecture": "Arquitetura",
  "quality-testing": "Qualidade & Testes",
  "ai-engineering": "Engenharia com IA",
  "distributed-systems": "Sistemas Distribuídos",
};

export interface ThemeIndex {
  date: string;
  title: string;
  description: string | null;
  category?: ThemeCategory;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mapToCards(theme: DailyTheme): Card[] {
  const result: Card[] = [];

  if (theme.context) {
    result.push({
      kind: "context",
      relevance: theme.context.relevance,
      sources: theme.sources,
    });
  }

  const groups: ThemeCard[][] = [];
  let current: ThemeCard[] = [];

  for (const c of theme.cards) {
    if (c.kind === "info" && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(c);
  }
  if (current.length > 0) groups.push(current);

  const [intro, ...rest] = groups;
  const shuffled = [intro, ...shuffle(rest)];

  for (const group of shuffled) {
    const [infoCard, ...pairs] = group;
    result.push({ kind: "info" as const, front: infoCard.front ?? "", back: infoCard.back ?? "" });
    for (const c of shuffle(pairs)) {
      result.push({ a: c.conceptA ?? "", b: c.conceptB ?? "", match: c.match ?? false, explanation: c.explanation ?? undefined });
    }
  }
  return result;
}
