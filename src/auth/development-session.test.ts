import { describe, expect, it } from "vitest";

import {
  createDevelopmentSessionToken,
  getDevelopmentIdentity,
  listDevelopmentIdentities,
  verifyDevelopmentSessionToken,
} from "@/auth/development-session";
import { SYNTHETIC_SEED_IDS } from "@/db/seed-data";

const secret = "synthetic-development-secret-with-32-bytes";
const issuedAt = new Date("2026-10-05T16:00:00.000Z");

describe("development session authentication", () => {
  it("lists only the three active synthetic seed identities", () => {
    expect(listDevelopmentIdentities()).toHaveLength(3);
    expect(
      listDevelopmentIdentities().map((identity) => identity.role),
    ).toEqual(["TEACHER", "ASSISTANT", "ASSISTANT"]);
  });

  it("creates and verifies a signed session for a known identity", () => {
    const token = createDevelopmentSessionToken(
      SYNTHETIC_SEED_IDS.assignedAssistant,
      secret,
      issuedAt,
    );

    expect(verifyDevelopmentSessionToken(token, secret, issuedAt)).toEqual(
      getDevelopmentIdentity(SYNTHETIC_SEED_IDS.assignedAssistant),
    );
  });

  it("rejects a modified signature", () => {
    const token = createDevelopmentSessionToken(
      SYNTHETIC_SEED_IDS.teacher,
      secret,
      issuedAt,
    );
    const [payload] = token.split(".");

    expect(
      verifyDevelopmentSessionToken(`${payload}.invalid`, secret, issuedAt),
    ).toBeNull();
  });

  it("rejects an expired session", () => {
    const token = createDevelopmentSessionToken(
      SYNTHETIC_SEED_IDS.teacher,
      secret,
      issuedAt,
    );
    const expiredAt = new Date("2026-10-06T00:00:01.000Z");

    expect(
      verifyDevelopmentSessionToken(token, secret, expiredAt),
    ).toBeNull();
  });

  it("refuses unknown identities and weak secrets", () => {
    expect(() =>
      createDevelopmentSessionToken(
        "90000000-0000-4000-8000-000000000001",
        secret,
        issuedAt,
      ),
    ).toThrow("Unknown synthetic development identity.");
    expect(() =>
      createDevelopmentSessionToken(
        SYNTHETIC_SEED_IDS.teacher,
        "too-short",
        issuedAt,
      ),
    ).toThrow("at least 32 bytes");
  });
});
