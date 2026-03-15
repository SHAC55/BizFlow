import { prisma } from "../config/db";
import { NOT_FOUND, OK } from "../constants/http";
import { safeUserSelect } from "../constants/userType";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const getUserHandler = catchErrors(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
  });
  appAssert(user, NOT_FOUND, "user not found");

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: safeUserSelect,
  });
  return res.status(OK).json(safeUser);
});
