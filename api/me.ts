import { getCurrentUser } from "../server/auth/getCurrentUser";
import { isAdmin } from "../server/auth/isAdmin";

interface ApiRequest {
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status(code: number): { json(payload: unknown): void };
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
): Promise<void> {
  const authState = await getCurrentUser(request);

  if (!authState.authenticated) {
    response.status(200).json(authState);
    return;
  }

  response.status(200).json({
    ...authState,
    user: {
      ...authState.user,
      isAdmin: isAdmin(authState.user.login),
    },
  });
}
