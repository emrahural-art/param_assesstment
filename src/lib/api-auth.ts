import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasPermission } from "@/lib/permissions";
import type { UserRole } from "@/generated/prisma/client";

type Permission = Parameters<typeof hasPermission>[1];

export class AuthError {
  constructor(
    public status: number,
    public message: string = status === 401 ? "Oturum gerekli" : "Yetkiniz yok",
  ) {}
}

export function authErrorResponse(err: AuthError) {
  return NextResponse.json({ error: err.message }, { status: err.status });
}

/**
 * Extracts and validates the JWT from the request.
 * Optionally checks a specific RBAC permission.
 * Throws AuthError on failure -- catch with authErrorResponse().
 */
export async function requireAuth(
  request: Request,
  permission?: Permission,
) {
  const token = await getToken({
    req: request as Parameters<typeof getToken>[0]["req"],
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.sub) {
    throw new AuthError(401);
  }

  if (permission) {
    const role = token.role as UserRole | undefined;
    if (!role || !hasPermission(role, permission)) {
      throw new AuthError(403);
    }
  }

  return token;
}

/**
 * Reads the JWT without enforcing auth (returns null if unauthenticated).
 */
export async function optionalAuth(request: Request) {
  return getToken({
    req: request as Parameters<typeof getToken>[0]["req"],
    secret: process.env.AUTH_SECRET,
  });
}
