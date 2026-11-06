import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { UserRole } from "./types";

export interface SessionPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

const getSecretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === "change_me_to_a_long_random_string") {
    // Fallback safe 256-bit key for local development if not configured
    return new TextEncoder().encode("hireforge_super_secure_secret_signing_key_2026_jwt_token_auth");
  }
  return new TextEncoder().encode(secret);
};

export const SESSION_COOKIE_NAME = "hf_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
