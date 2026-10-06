import type { PoolConfig } from "pg";

type DatabasePoolOptions = {
  serverless?: boolean;
};

const localDatabaseHosts = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Keeps each serverless instance to one client connection and requires an
 * encrypted connection for hosted Postgres providers such as Supabase.
 */
export function createDatabasePoolConfig(
  connectionString: string,
  options: DatabasePoolOptions = {},
): PoolConfig {
  const url = new URL(connectionString);
  const isLocal = localDatabaseHosts.has(url.hostname);

  if (!isLocal) {
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }

    // pg-connection-string otherwise treats sslmode=require like verify-full.
    // Supabase's pooler certificate chain is encrypted but not locally trusted,
    // so opt into libpq's standard `require` behavior unless the caller chose a
    // stricter verification mode explicitly.
    if (
      url.searchParams.get("sslmode") === "require" &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }
  }

  return {
    connectionString: url.toString(),
    max: options.serverless ? 1 : 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: options.serverless ? 10_000 : 30_000,
    allowExitOnIdle: !options.serverless,
  };
}
