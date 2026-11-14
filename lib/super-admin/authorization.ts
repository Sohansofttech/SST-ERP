import "server-only";
import { prisma } from "@/lib/super-admin/prisma";

export async function hasSuperAdminRole(userId: string) {
  const user = await prisma.platformUser.findUnique({
    where: { id: userId },
    select: { platformRole: true, status: true },
  });

  return user?.platformRole === "SUPER_ADMIN" && user.status === "ACTIVE";
}
