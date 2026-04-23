import type {
  LoginPayload,
  RegisterPayload,
  Tokens,
  User,
} from "../types/auth";
import { assertApiUrl } from "../config";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
};

type MobileAuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type LoginResponse = MobileAuthResponse & {
  message: string;
};

type RefreshResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
};

const createHeaders = (headers?: Record<string, string>) => ({
  Accept: "application/json",
  ...headers,
});

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${assertApiUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: createHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();
  const data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;

  if (!response.ok) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`,
    );
  }

  return data as T;
};

const mobileHeaders = {
  "Content-Type": "application/json",
  "x-client-type": "mobile",
};

export const login = (payload: LoginPayload) =>
  request<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    headers: mobileHeaders,
  });

export const register = (payload: RegisterPayload) =>
  request<MobileAuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    headers: mobileHeaders,
  });

export const refreshSession = (refreshToken: string) =>
  request<RefreshResponse>("/auth/refresh", {
    headers: {
      "x-client-type": "mobile",
      "x-refresh-token": refreshToken,
    },
  });

export const fetchCurrentUser = (accessToken: string) =>
  request<User>("/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const logout = (accessToken: string) =>
  request<{ message: string }>("/auth/logout", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const buildGoogleAuthUrl = (redirectUri: string) =>
  `${assertApiUrl()}/auth/google?mobile_redirect_uri=${encodeURIComponent(
    redirectUri,
  )}`;

export const toTokens = (response: Tokens | MobileAuthResponse): Tokens => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
});
