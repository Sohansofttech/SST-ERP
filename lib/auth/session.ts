import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser } from "@/types";
import { AUTH_COOKIE_NAME, verifyToken } from "./jwt";

export async function getSession(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // In non-request contexts
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access denied: insufficient permissions or tenant violation") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAuth(req?: NextRequest): Promise<SessionUser> {
  const session = await getSession(req);
  if (!session) {
    throw new UnauthorizedError("Please log in to continue");
  }
  return session;
}

export async function requireRole(
  req: NextRequest | undefined,
  allowedRoles: string[]
): Promise<SessionUser> {
  const session = await requireAuth(req);
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(`Access restricted to roles: ${allowedRoles.join(", ")}`);
  }
  return session;
}
