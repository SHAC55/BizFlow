import bcrypt from "bcrypt";
import type { User } from "../generated/prisma/client";

export async function comparePassword(
  user: User,
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, user.password);
}
