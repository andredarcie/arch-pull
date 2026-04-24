import { serverConfig } from "../config";

export function isAdmin(githubLogin: string): boolean {
  return serverConfig.adminGithubLogins().includes(githubLogin);
}
