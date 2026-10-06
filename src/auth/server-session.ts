import "server-only";

import { cookies } from "next/headers";

import {
  createDevelopmentSessionToken,
  DEVELOPMENT_SESSION_TTL_SECONDS,
  verifyDevelopmentSessionToken,
} from "@/auth/development-session";

export const DEVELOPMENT_SESSION_COOKIE = "sped_development_session";

const getSecret = () => {
  const secret = process.env.DEVELOPMENT_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "DEVELOPMENT_AUTH_SECRET is required for synthetic role access.",
    );
  }
  return secret;
};

export async function getCurrentDevelopmentIdentity() {
  const token = (await cookies()).get(DEVELOPMENT_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifyDevelopmentSessionToken(token, getSecret());
}

export async function setDevelopmentIdentity(userId: string) {
  const token = createDevelopmentSessionToken(userId, getSecret());
  (await cookies()).set(DEVELOPMENT_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: DEVELOPMENT_SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearDevelopmentIdentity() {
  (await cookies()).delete(DEVELOPMENT_SESSION_COOKIE);
}
