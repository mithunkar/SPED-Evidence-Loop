import { describe, expect, it } from "vitest";

import { getSupabaseConfig } from "./config";

describe("Supabase configuration", () => {
  it("returns the public project configuration", () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      publishableKey: "sb_publishable_example",
    });
  });

  it("fails closed when either value is missing", () => {
    expect(() => getSupabaseConfig({})).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.",
    );
  });
});
