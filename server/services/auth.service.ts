import { prisma } from "../config/db";
import { hashValue } from "../utils/bcrypt";
import { VerificationCodeType } from "../generated/prisma/enums";
import {
  fiveMinutsAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import jwt from "jsonwebtoken";
import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import appAssert from "../utils/appAssert";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import { comparePassword } from "../utils/comparePassword";
import {
  refreshTokenSignOptions,
  signToken,
  verifyToken,
  type RefreshTokenPayload,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTemplates";

export type createAccountParams = {
  businessName: string;
  username: string;
  email?: string;
  phone: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  const userExists = await prisma.user.findUnique({
    where: { mobile: data.phone },
  });
  appAssert(!userExists, 409, "phone number already in use");

  const hashedPassword = await hashValue(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.username,
      mobile: data.phone,
      email: data.email,
      password: hashedPassword,
      business: {
        create: {
          name: data.businessName,
        },
      },
    },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      provider: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
      business: {
        select: {
          id: true,
          name: true,
          gstNumber: true,
          address: true,
        },
      },
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: data.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions,
  );
  const accessToken = signToken({
    userId: user.id,
    sessionId: session.id,
  });

  return { user, accessToken, refreshToken };
};

export type LoginParams = {
  username: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async (data: LoginParams) => {
  const user = await prisma.user.findFirst({
    where: { name: data.username },
  });
  appAssert(user, UNAUTHORIZED, "invalid username");

  const isValid = await comparePassword(user, data.password);
  appAssert(isValid, UNAUTHORIZED, "invalid password");

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: data.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions,
  );
  const accessToken = signToken({
    userId: user.id,
    sessionId: session.id,
  });

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      provider: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
      business: {
        select: {
          id: true,
          name: true,
          gstNumber: true,
          address: true,
        },
      },
    },
  });

  return { safeUser, accessToken, refreshToken };
};

export type GoogleAuthParams = {
  email: string;
  name: string;
  provider: string;
  userAgent?: string;
};
export const googleAuth = async (data: GoogleAuthParams) => {
  let user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email ?? null,
        name: null, // ?? leave null - user will fill in onboarding
        mobile: null, // ?? leave null - user will fill in onboarding
        provider: data.provider,
        verified: true,
      },
    });
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: data.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions,
  );
  const accessToken = signToken({
    userId: user.id,
    sessionId: session.id,
  });

  // if mobile and name are missing, onboarding is needed
  const isOnboardingComplete = !!(user.mobile && user.name);

  return { accessToken, refreshToken, isOnboardingComplete };
};
export type OnboardingParams = {
  userId: number;
  phone: string;
  username: string;
  businessName: string;
};

export const completeOnboarding = async (data: OnboardingParams) => {
  const user = await prisma.user.update({
    where: { id: data.userId },
    data: {
      mobile: data.phone,
      name: data.username,
      business: {
        create: {
          name: data.businessName,
        },
      },
    },
  });
  appAssert(user, INTERNAL_SERVER_ERROR, "failed to complete onboarding");
  return user;
};
export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await prisma.session.findUnique({
    where: {
      id: payload.sessionId,
    },
  });
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired",
  );

  // refresh the session if it expires in the next 24hrs
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        expiresAt: thirtyDaysFromNow(),
      },
    });
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session.id,
        },
        refreshTokenSignOptions,
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session.id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  const validCode = await prisma.verificationCode.findFirst({
    where: {
      id: code,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: { gt: new Date() },
    },
  });
  appAssert(validCode, NOT_FOUND, "invalid or expired verification code");
  const updatedUser = await prisma.user.update({
    where: { id: validCode.userId },
    data: {
      verified: true,
    },
  });
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "failed to verify user");
  await prisma.verificationCode.delete({
    where: { id: validCode.id },
  });

  const safeUser = await prisma.user.findUnique({
    where: { id: updatedUser.id },
    select: {
      id: true,
      email: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return safeUser;
};

export const sendPasswordResetEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  appAssert(user, NOT_FOUND, "please check your email");

  const FIVE_MINUTES_AGO = fiveMinutsAgo();
  const count = await prisma.verificationCode.count({
    where: {
      userId: user.id,
      type: VerificationCodeType.PASSWORD_RESET,
      createdAt: {
        gt: FIVE_MINUTES_AGO,
      },
    },
  });
  appAssert(
    count <= 1,
    TOO_MANY_REQUESTS,
    "too many requests, please try again after some time",
  );
  const expiresAt = oneHourFromNow();
  const verificationCode = await prisma.verificationCode.create({
    data: {
      userId: user.id,
      type: VerificationCodeType.PASSWORD_RESET,
      expiresAt,
    },
  });
  const url = `/${APP_ORIGIN}/password/reset?code=${verificationCode.id}&exp=${expiresAt.getTime()}`;
  appAssert(user.email, NOT_FOUND, "please check your email");

  await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });
  //appAssert(response, INTERNAL_SERVER_ERROR, "failed to send email");
  return {
    url,
  };
};
type resetPasswordParams = {
  password: string;
  verificationCode: string;
};
export const resetPassword = async ({
  password,
  verificationCode,
}: resetPasswordParams) => {
  const validCode = await prisma.verificationCode.findFirst({
    where: {
      id: verificationCode,
      type: VerificationCodeType.PASSWORD_RESET,
      expiresAt: { gt: new Date() },
    },
  });

  appAssert(validCode, NOT_FOUND, "invalid or expired verification code");
  const updatedUser = await prisma.user.update({
    where: {
      id: validCode.userId,
    },
    data: {
      password: await hashValue(password),
    },
  });
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "failed to reset password");
  await prisma.verificationCode.delete({
    where: {
      id: validCode.id,
    },
  });
  await prisma.session.deleteMany({
    where: {
      userId: updatedUser.id,
    },
  });
  const safeUser = await prisma.user.findUnique({
    where: { id: updatedUser.id },
    select: {
      id: true,
      email: true,
      verified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return safeUser;
};
