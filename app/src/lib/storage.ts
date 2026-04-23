import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "../types/auth";

const SESSION_KEY = "bizeazy.auth.session";

export const readStoredSession = async () => {
  const rawValue = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
};

export const writeStoredSession = async (session: AuthSession) =>
  SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));

export const clearStoredSession = async () =>
  SecureStore.deleteItemAsync(SESSION_KEY);
