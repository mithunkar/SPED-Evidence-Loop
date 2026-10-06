import { describe, expect, it } from "vitest";

import { emailPasswordSchema, workspaceSetupSchema } from "./credentials";

describe("account credential validation", () => {
  it("normalizes valid email credentials", () => {
    expect(
      emailPasswordSchema.parse({
        email: " Teacher@Example.com ",
        password: "classroom-passphrase",
      }),
    ).toEqual({
      email: "teacher@example.com",
      password: "classroom-passphrase",
    });
  });

  it("rejects short passwords", () => {
    expect(
      emailPasswordSchema.safeParse({
        email: "teacher@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });

  it("trims first-workspace details", () => {
    expect(
      workspaceSetupSchema.parse({
        displayName: "  Morgan  ",
        workspaceName: "  Room 12  ",
      }),
    ).toEqual({ displayName: "Morgan", workspaceName: "Room 12" });
  });
});
