import type { RoleType } from "@prisma/client";

export const appRoles: RoleType[] = [
  "FOUNDER",
  "REVIEWER",
  "TRUSTED_REVIEWER",
  "SENIOR_EXPERT",
  "ADMIN",
  "MODERATOR",
];

export function hasAnyRole(userRoles: RoleType[], required: RoleType[]) {
  return required.some((role) => userRoles.includes(role));
}

export function canModerate(userRoles: RoleType[]) {
  return hasAnyRole(userRoles, ["ADMIN", "MODERATOR"]);
}

export function canReview(userRoles: RoleType[]) {
  return hasAnyRole(userRoles, ["REVIEWER", "TRUSTED_REVIEWER", "ADMIN"]);
}

export function canExpert(userRoles: RoleType[]) {
  return hasAnyRole(userRoles, ["SENIOR_EXPERT", "ADMIN"]);
}
