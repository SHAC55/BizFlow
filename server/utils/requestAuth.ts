import type { Request } from "express";

const MOBILE_CLIENT_HEADER = "x-client-type";
const REFRESH_TOKEN_HEADER = "x-refresh-token";

export const isMobileAuthRequest = (req: Request) =>
  req.headers[MOBILE_CLIENT_HEADER] === "mobile";

export const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice("Bearer ".length).trim() || undefined;
};

export const getAccessTokenFromRequest = (req: Request) =>
  req.cookies["accessToken"] || getBearerToken(req.headers.authorization);

export const getRefreshTokenFromRequest = (req: Request) => {
  const headerValue = req.headers[REFRESH_TOKEN_HEADER];
  const refreshTokenHeader = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue;

  return (
    req.cookies["refreshToken"] ||
    refreshTokenHeader ||
    req.body?.refreshToken
  );
};

type GoogleMobileState = {
  redirectUri: string;
};

export const encodeGoogleMobileState = (state: GoogleMobileState) =>
  Buffer.from(JSON.stringify(state)).toString("base64url");

export const decodeGoogleMobileState = (value?: string) => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<GoogleMobileState>;

    if (!parsed.redirectUri || typeof parsed.redirectUri !== "string") {
      return null;
    }

    return { redirectUri: parsed.redirectUri };
  } catch {
    return null;
  }
};
