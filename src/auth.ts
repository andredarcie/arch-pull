export interface AuthUser {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
  isAdmin?: boolean;
}

export type AuthState =
  | { authenticated: true; user: AuthUser }
  | { authenticated: false; user: null };

export const unauthenticatedState: AuthState = {
  authenticated: false,
  user: null,
};
