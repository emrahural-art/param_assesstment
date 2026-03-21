import { type UserRole } from "@/generated/prisma/client";

type Permission =
  | "candidates:read"
  | "candidates:write"
  | "candidates:delete"
  | "assessments:read"
  | "assessments:write"
  | "assessments:delete"
  | "pipeline:read"
  | "pipeline:write"
  | "communication:read"
  | "communication:send"
  | "communication:templates"
  | "evaluation:read"
  | "evaluation:write"
  | "listings:read"
  | "listings:write"
  | "settings:read"
  | "settings:write"
  | "users:manage";

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "candidates:read", "candidates:write", "candidates:delete",
    "assessments:read", "assessments:write", "assessments:delete",
    "pipeline:read", "pipeline:write",
    "communication:read", "communication:send", "communication:templates",
    "evaluation:read", "evaluation:write",
    "listings:read", "listings:write",
    "settings:read", "settings:write",
    "users:manage",
  ],
  HR_MANAGER: [
    "candidates:read", "candidates:write", "candidates:delete",
    "assessments:read", "assessments:write", "assessments:delete",
    "pipeline:read", "pipeline:write",
    "communication:read", "communication:send", "communication:templates",
    "evaluation:read", "evaluation:write",
    "listings:read", "listings:write",
    "settings:read",
  ],
  HR_SPECIALIST: [
    "candidates:read", "candidates:write",
    "assessments:read", "assessments:write",
    "pipeline:read", "pipeline:write",
    "communication:read", "communication:send",
    "evaluation:read", "evaluation:write",
    "listings:read",
  ],
  HR_INTERN: [
    "candidates:read",
    "assessments:read",
    "pipeline:read",
    "communication:read",
    "evaluation:read",
    "listings:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
