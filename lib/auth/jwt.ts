import { SignJWT, jwtVerify } from "jose";
import { SessionUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "erp-secret-super-secure-key-32-chars-long!";
const key = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "erp_session";

export async function signToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionUser;
  } catch (error) {
    return null;
  }
}

