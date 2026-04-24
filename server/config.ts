const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_DURATION_SECONDS = 60 * 10;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverConfig = {
  githubClientId: () => requireEnv("GITHUB_CLIENT_ID"),
  githubClientSecret: () => requireEnv("GITHUB_CLIENT_SECRET"),
  sessionSecret: () => requireEnv("SESSION_SECRET"),
  appUrl: () => process.env.APP_URL ?? "http://localhost:3000",
  databaseUrl: () => process.env.DATABASE_URL,
  sessionCookieName: "archpull_session",
  oauthStateCookieName: "archpull_oauth_state",
  sessionDurationSeconds: SESSION_DURATION_SECONDS,
  oauthStateDurationSeconds: OAUTH_STATE_DURATION_SECONDS,
  isProduction: process.env.NODE_ENV === "production",
  adminGithubLogins: () =>
    (process.env.ADMIN_GITHUB_LOGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
} as const;
