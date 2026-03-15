import catchErrors from "../utils/catchErrors";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
  resetPassword,
  sendPasswordResetEmail,
  verifyEmail,
} from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/db";
import appAssert from "../utils/appAssert";

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

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  const { accessToken, refreshToken } = await loginUser(request);
  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "login successful",
  });
});
export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies["access-token"] as string | undefined;

  const { payload } = verifyToken(accessToken || "");

  if (payload) {
    await prisma.session.deleteMany({
      where: {
        id: Number(payload.sessionId),
      },
    });
  }
  return clearAuthCookies(res).status(OK).json({
    message: "logout successful",
  });
});
export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies["refresh-token"] as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "missing refresh-token");
  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);
  if (newRefreshToken) {
    res.cookie(
      "refresh-token",
      newRefreshToken,
      getRefreshTokenCookieOptions(),
    );
  }
  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Access Token Refreshed",
    });
});
export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);
  await verifyEmail(verificationCode);
  return res.status(OK).json({
    message: "email verified",
  });
});

export const forgotPasswordHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);
  await sendPasswordResetEmail(email);
  return res.status(OK).json({
    message: "password reset email send",
  });
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);
  await resetPassword(request);
  return clearAuthCookies(res).status(OK).json({
    message: "password reset successful",
  });
});
