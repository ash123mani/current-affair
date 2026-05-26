import { auth } from "./auth";
import { AppError, ForbiddenError } from "./errors";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new AppError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  return session;
}
