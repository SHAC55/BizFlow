const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const apiUrl = rawApiUrl?.replace(/\/+$/, "") ?? "";

export const assertApiUrl = () => {
  if (!apiUrl) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_URL. Set it in app/.env before using auth.",
    );
  }

  return apiUrl;
};
