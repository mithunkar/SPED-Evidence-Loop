import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { syntheticSeedData } from "@/db/seed-data";

export const DEVELOPMENT_SESSION_TTL_SECONDS = 8 * 60 * 60;

export type DevelopmentIdentity = {
  id: string;
  workspaceId: string;
  displayName: string;
  email: string;
  role: "TEACHER" | "ASSISTANT";
};

const sessionPayloadSchema = z.object({
  version: z.literal(1),
  userId: z.uuid(),
  issuedAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().positive(),
});

const developmentIdentities = syntheticSeedData.users.map(
  (user): DevelopmentIdentity => ({
    id: user.id,
    workspaceId: user.workspaceId,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
  }),
);

const assertDevelopmentOnly = () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Development authentication is disabled in production.");
  }
};

const assertSecret = (secret: string) => {
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "DEVELOPMENT_AUTH_SECRET must contain at least 32 bytes.",
    );
  }
};

const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export function listDevelopmentIdentities() {
  assertDevelopmentOnly();
  return developmentIdentities;
}

export function getDevelopmentIdentity(userId: string) {
  assertDevelopmentOnly();
  return developmentIdentities.find((identity) => identity.id === userId) ?? null;
}

export function createDevelopmentSessionToken(
  userId: string,
  secret: string,
  now = new Date(),
) {
  assertDevelopmentOnly();
  assertSecret(secret);

  if (!getDevelopmentIdentity(userId)) {
    throw new Error("Unknown synthetic development identity.");
  }

  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      userId,
      issuedAt,
      expiresAt: issuedAt + DEVELOPMENT_SESSION_TTL_SECONDS,
    }),
    "utf8",
  ).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

export function verifyDevelopmentSessionToken(
  token: string,
  secret: string,
  now = new Date(),
) {
  assertDevelopmentOnly();
  assertSecret(secret);

  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) {
    return null;
  }

  const expectedSignature = sign(payload, secret);
  const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = sessionPayloadSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    if (!parsed.success) {
      return null;
    }

    const nowInSeconds = Math.floor(now.getTime() / 1000);
    if (
      parsed.data.expiresAt <= nowInSeconds ||
      parsed.data.issuedAt > nowInSeconds + 60 ||
      parsed.data.expiresAt - parsed.data.issuedAt !==
        DEVELOPMENT_SESSION_TTL_SECONDS
    ) {
      return null;
    }

    return getDevelopmentIdentity(parsed.data.userId);
  } catch {
    return null;
  }
}
