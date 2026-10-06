import { describe, expect, it } from "vitest";

import { createStudentSchema } from "./student";

describe("student creation validation", () => {
  it("trims the display name", () => {
    expect(
      createStudentSchema.parse({
        displayName: "  Avery  ",
      }),
    ).toEqual({ displayName: "Avery" });
  });

  it("rejects a blank display name", () => {
    expect(
      createStudentSchema.safeParse({ displayName: "  " }).success,
    ).toBe(false);
  });
});
