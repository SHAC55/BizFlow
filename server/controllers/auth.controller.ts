import catchErrors from "../utils/catchErrors";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
  googleAuth,
  completeOnboarding,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
  onboardingSchema,
} from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/db";
import appAssert from "../utils/appAssert";

// ÄÄ Register ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { user, accessToken, refreshToken } = await createAccount(request);
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

// ÄÄ Login ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { safeUser, accessToken, refreshToken } = await loginUser(request);
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "login successful", user: safeUser });
});

// ÄÄ Logout ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies["accessToken"] as string | undefined;
  const { payload } = verifyToken(accessToken || "");

  if (payload) {
    await prisma.session.deleteMany({
      where: { id: Number(payload.sessionId) },
    });
  }

  return clearAuthCookies(res).status(OK).json({
    message: "logout successful",
  });
});

// ÄÄ Refresh Token ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies["refreshToken"] as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "missing refresh token");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "access token refreshed" });
});

// ÄÄ Verify Email ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);
  await verifyEmail(verificationCode);
  return res.status(OK).json({ message: "email verified" });
});

// ÄÄ Forgot Password ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const forgotPasswordHandler = catchErrors(async (req, res) => {
  const { email } = req.body;
  appAssert(email, 400, "email is required");
  await sendPasswordResetEmail(email);
  return res.status(OK).json({ message: "password reset email sent" });
});

// ÄÄ Reset Password ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);
  await resetPassword(request);
  return clearAuthCookies(res).status(OK).json({
    message: "password reset successful",
  });
});

// ÄÄ Google OAuth Callback ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const googleAuthCallbackHandler = catchErrors(async (req, res) => {
  const { email, name, provider } = req.user as {
    email: string;
    name: string;
    provider: string;
  };

  const { accessToken, refreshToken, isOnboardingComplete } = await googleAuth({
    email,
    name,
    provider,
    userAgent: req.headers["user-agent"],
  });

  setAuthCookies({ res, accessToken, refreshToken });

  const redirectUrl = isOnboardingComplete
    ? `${process.env.APP_ORIGIN}/dashboard`
    : `${process.env.APP_ORIGIN}/onboarding`;

  return res.redirect(redirectUrl);
});

// ÄÄ Onboarding ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ
export const onboardingHandler = catchErrors(async (req, res) => {
  const request = onboardingSchema.parse(req.body);
  const userId = req.userId;
  appAssert(userId, UNAUTHORIZED, "not authenticated");

  const user = await completeOnboarding({
    userId,
    phone: request.phone,
    username: request.username,
    businessName: request.businessName,
  });

  return res.status(OK).json({ message: "onboarding complete", user });
});
