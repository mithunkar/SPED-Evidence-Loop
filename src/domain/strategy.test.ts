import { describe, expect, it } from "vitest";

import { assignStrategySchema } from "./strategy";

describe("strategy assignment validation", () => {
  it("trims the strategy fields", () => {
    expect(
      assignStrategySchema.parse({
        name: " Visual cue ",
        instructions: " Show the cue, give one direction, then wait. ",
        fidelityPrompt: " Was the cue shown before the direction? ",
      }),
    ).toEqual({
      name: "Visual cue",
      instructions: "Show the cue, give one direction, then wait.",
      fidelityPrompt: "Was the cue shown before the direction?",
    });
  });

  it("rejects empty instructions", () => {
    expect(
      assignStrategySchema.safeParse({
        name: "Visual cue",
        instructions: "",
        fidelityPrompt: "Was the cue used as planned?",
      }).success,
    ).toBe(false);
  });
});
