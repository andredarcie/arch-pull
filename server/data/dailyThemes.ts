import { eq, desc } from "drizzle-orm";
import { dailyThemes, dailyCards } from "../db/schema";
import { getDb } from "../lib/db";

export interface DailyCardInput {
  kind: "pair" | "info";
  position: number;
  conceptA?: string;
  conceptB?: string;
  match?: boolean;
  front?: string;
  back?: string;
}

export interface DailyThemeInput {
  date: string;
  title: string;
  description?: string;
  cards: DailyCardInput[];
}

export interface DailyCard {
  id: string;
  kind: "pair" | "info";
  position: number;
  conceptA: string | null;
  conceptB: string | null;
  match: boolean | null;
  front: string | null;
  back: string | null;
}

export interface DailyTheme {
  id: string;
  date: string;
  title: string;
  description: string | null;
  cards: DailyCard[];
  createdAt: Date;
  updatedAt: Date;
}

function mapCard(c: typeof dailyCards.$inferSelect): DailyCard {
  return {
    id: c.id,
    kind: c.kind as "pair" | "info",
    position: c.position,
    conceptA: c.conceptA,
    conceptB: c.conceptB,
    match: c.match,
    front: c.front,
    back: c.back,
  };
}

async function loadCardsForTheme(themeId: string): Promise<DailyCard[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(dailyCards)
    .where(eq(dailyCards.themeId, themeId))
    .orderBy(dailyCards.position);
  return rows.map(mapCard);
}

export async function listDailyThemes(): Promise<DailyTheme[]> {
  const db = getDb();
  const themes = await db
    .select()
    .from(dailyThemes)
    .orderBy(desc(dailyThemes.date));

  return Promise.all(
    themes.map(async (t) => ({
      ...t,
      cards: await loadCardsForTheme(t.id),
    }))
  );
}

export async function getDailyThemeByDate(date: string): Promise<DailyTheme | null> {
  const db = getDb();
  const [theme] = await db
    .select()
    .from(dailyThemes)
    .where(eq(dailyThemes.date, date));

  if (!theme) return null;

  return { ...theme, cards: await loadCardsForTheme(theme.id) };
}

export async function upsertDailyTheme(input: DailyThemeInput): Promise<DailyTheme> {
  const db = getDb();

  const [existing] = await db
    .select({ id: dailyThemes.id })
    .from(dailyThemes)
    .where(eq(dailyThemes.date, input.date));

  let themeId: string;

  if (existing) {
    themeId = existing.id;
    await db
      .update(dailyThemes)
      .set({
        title: input.title,
        description: input.description ?? null,
        updatedAt: new Date(),
      })
      .where(eq(dailyThemes.id, themeId));
    await db.delete(dailyCards).where(eq(dailyCards.themeId, themeId));
  } else {
    const [created] = await db
      .insert(dailyThemes)
      .values({
        date: input.date,
        title: input.title,
        description: input.description ?? null,
      })
      .returning({ id: dailyThemes.id });
    themeId = created.id;
  }

  if (input.cards.length > 0) {
    await db.insert(dailyCards).values(
      input.cards.map((c) => ({
        themeId,
        kind: c.kind,
        position: c.position,
        conceptA: c.conceptA ?? null,
        conceptB: c.conceptB ?? null,
        match: c.match ?? null,
        front: c.front ?? null,
        back: c.back ?? null,
      }))
    );
  }

  return (await getDailyThemeByDate(input.date))!;
}

export async function deleteDailyTheme(date: string): Promise<void> {
  const db = getDb();
  await db.delete(dailyThemes).where(eq(dailyThemes.date, date));
}
