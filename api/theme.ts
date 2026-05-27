import { readFileSync, readdirSync } from "fs";
import { join } from "path";

interface ApiResponse {
  status(code: number): { json(payload: unknown): void };
}

export default async function handler(
  _request: unknown,
  response: ApiResponse
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const themesDir = join(process.cwd(), "content", "themes");

  let theme = null;
  try {
    const files = readdirSync(themesDir);
    const file = files.find((f) => f.startsWith(today));
    if (file) {
      theme = JSON.parse(readFileSync(join(themesDir, file), "utf-8")) as unknown;
    }
  } catch {
    // no file for today
  }

  response.status(200).json(theme ?? null);
}
