import bcrypt from "bcrypt";
import type { User } from "../generated/prisma/client";

export async function comparePassword(
  user: User,
  plain: string,
): Promise<boolean> {
  if (!user.password) {
    return false;
  }

  return bcrypt.compare(plain, user.password);
}
