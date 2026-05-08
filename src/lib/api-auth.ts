import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { RoleType } from "@prisma/client";

export async function getCurrentUserContext() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const roles = user.userRoles.map((entry) => entry.role.type) as RoleType[];

  return {
    user,
    roles,
  };
}
