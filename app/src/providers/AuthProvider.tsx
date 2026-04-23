import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import * as Linking from "expo-linking";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  buildGoogleAuthUrl,
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
  toTokens,
} from "../lib/api";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "../lib/storage";
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: AuthSession | null;
  isReady: boolean;
  isBusy: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getNeedsOnboarding = (user: User) =>
  !user.name || !user.mobile || !user.business?.name;

const buildSession = (user: User, accessToken: string, refreshToken: string) => ({
  user,
  tokens: { accessToken, refreshToken },
  needsOnboarding: getNeedsOnboarding(user),
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = await readStoredSession();

        if (!storedSession) {
          setSession(null);
          return;
        }

        const refreshed = await refreshSession(storedSession.tokens.refreshToken);
        const user = await fetchCurrentUser(refreshed.accessToken);
        const nextSession = buildSession(
          user,
          refreshed.accessToken,
          refreshed.refreshToken,
        );

        setSession(nextSession);
        await writeStoredSession(nextSession);
      } catch {
        setSession(null);
        await clearStoredSession();
      } finally {
        setIsReady(true);
      }
    };

    restoreSession();
  }, []);

  const persistSession = async (nextSession: AuthSession) => {
    setSession(nextSession);
    await writeStoredSession(nextSession);
  };

  const login = async (payload: LoginPayload) => {
    setIsBusy(true);

    try {
      const response = await loginRequest(payload);
      const nextSession = buildSession(
        response.user,
        response.accessToken,
        response.refreshToken,
      );
      await persistSession(nextSession);
    } finally {
      setIsBusy(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsBusy(true);

    try {
      const response = await registerRequest(payload);
      const nextSession = buildSession(
        response.user,
        response.accessToken,
        response.refreshToken,
      );
      await persistSession(nextSession);
    } finally {
      setIsBusy(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsBusy(true);

    try {
      const redirectUri = makeRedirectUri({
        scheme: "bizeazy",
        path: "auth",
      });
      const authUrl = buildGoogleAuthUrl(redirectUri);
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== "success") {
        return;
      }

      const parsedUrl = Linking.parse(result.url);
      const accessToken = parsedUrl.queryParams?.accessToken;
      const refreshToken = parsedUrl.queryParams?.refreshToken;
      const error = parsedUrl.queryParams?.error;

      if (typeof error === "string") {
        throw new Error("Google sign-in failed");
      }

      if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
        throw new Error("Google sign-in did not return valid mobile tokens");
      }

      const user = await fetchCurrentUser(accessToken);
      const nextSession = buildSession(user, accessToken, refreshToken);
      await persistSession(nextSession);
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    const accessToken = session?.tokens.accessToken;

    setSession(null);
    await clearStoredSession();

    if (!accessToken) {
      return;
    }

    try {
      await logoutRequest(accessToken);
    } catch {
      // The local session is already cleared; ignore remote logout failures.
    }
  };

  const value = useMemo(
    () => ({
      session,
      isReady,
      isBusy,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [isBusy, isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
