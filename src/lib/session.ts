import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { RoleType } from "@prisma/client";
import { hasAnyRole } from "@/lib/rbac";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireRoles(required: RoleType[]) {
  const session = await requireSession();
  const roles = (session.user.roles ?? []) as RoleType[];
  if (!hasAnyRole(roles, required)) {
    redirect("/app/dashboard?forbidden=1");
  }
  return session;
}
