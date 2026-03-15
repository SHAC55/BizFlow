import z from "zod";
import { prisma } from "../config/db";
import { NOT_FOUND, OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";

export const getSessionHandler = catchErrors(async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: {
      userId: req.userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res.status(OK).json(
    sessions.map((session) => ({
      ...session,
      ...(session.id === req.sessionId && {
        isCurrent: true,
      }),
    })),
  );
});
export const deleteSessionHandler = catchErrors(async (req, res) => {
  const sessionId = z.coerce.number().int().parse(req.params.id);
  const deleted = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId: req.userId,
    },
  });
  appAssert(deleted, NOT_FOUND, "session not found");
  return res.status(OK).json({
    message: "session deleted",
  });
});
