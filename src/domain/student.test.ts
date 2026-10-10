import { describe, expect, it } from "vitest";

import { createStudentSchema } from "./student";

describe("student creation validation", () => {
  it("trims the display name", () => {
    expect(
      createStudentSchema.parse({
        displayName: "  Avery  ",
        group: "AM_MW",
      }),
    ).toEqual({ displayName: "Avery", group: "AM_MW" });
  });

  it("rejects a blank display name", () => {
    expect(
      createStudentSchema.safeParse({ displayName: "  ", group: "AM_MW" }).success,
    ).toBe(false);
  });

  it("requires a schedule group", () => {
    expect(createStudentSchema.safeParse({ displayName: "Avery" }).success).toBe(false);
  });
});
