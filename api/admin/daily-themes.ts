import { getCurrentUser } from "../../server/auth/getCurrentUser";
import { isAdmin } from "../../server/auth/isAdmin";
import {
  listDailyThemes,
  upsertDailyTheme,
  deleteDailyTheme,
  type DailyThemeInput,
} from "../../server/data/dailyThemes";

interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): { json(payload: unknown): void; end(): void };
}

function parseBody(body: unknown): unknown {
  if (typeof body === "string") return JSON.parse(body) as unknown;
  return body;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  const authState = await getCurrentUser(req);
  if (!authState.authenticated || !isAdmin(authState.user.login)) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  if (req.method === "GET") {
    const themes = await listDailyThemes();
    res.status(200).json(themes);
    return;
  }

  if (req.method === "POST") {
    const body = parseBody(req.body) as Partial<DailyThemeInput>;
    if (!body.date || !body.title || !Array.isArray(body.cards)) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }
    const theme = await upsertDailyTheme({
      date: body.date,
      title: body.title,
      description: body.description,
      cards: body.cards,
    });
    res.status(200).json(theme);
    return;
  }

  if (req.method === "DELETE") {
    const body = parseBody(req.body) as { date?: string };
    if (!body.date) {
      res.status(400).json({ error: "invalid_payload" });
      return;
    }
    await deleteDailyTheme(body.date);
    res.status(204).end();
    return;
  }

  res.status(405).end();
}
