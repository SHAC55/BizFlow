import type { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

export const REFRESH_PATH = "/auth/refresh";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure: false,
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: REFRESH_PATH,
});

type params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: params) =>
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())    // ?? fixed
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions()); // ?? fixed

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken")                                            // ?? fixed
    .clearCookie("refreshToken", { path: REFRESH_PATH });                  // ?? fixed
