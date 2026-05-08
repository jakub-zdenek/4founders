import type { Project, RoleType, VisibilityMode } from "@prisma/client";
import { hasAnyRole } from "@/lib/rbac";

export function canAccessByVisibility(
  mode: VisibilityMode,
  userRoles: RoleType[],
  isOwner: boolean,
): boolean {
  if (isOwner) {
    return true;
  }

  switch (mode) {
    case "PUBLIC":
      return true;
    case "LIMITED":
      return hasAnyRole(userRoles, ["REVIEWER", "TRUSTED_REVIEWER", "SENIOR_EXPERT", "ADMIN", "MODERATOR"]);
    case "PROTECTED":
      return hasAnyRole(userRoles, ["TRUSTED_REVIEWER", "SENIOR_EXPERT", "ADMIN", "MODERATOR"]);
    case "EXPERT_ONLY":
      return hasAnyRole(userRoles, ["SENIOR_EXPERT", "ADMIN", "MODERATOR"]);
    default:
      return false;
  }
}

export function canAccessProject(project: Project, userId: string | null, userRoles: RoleType[]): boolean {
  const isOwner = userId === project.ownerId;
  return canAccessByVisibility(project.visibilityMode, userRoles, isOwner);
}
