import { createClient, SupabaseClient } from "@supabase/supabase-js";

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  if (
    envLoaded
    || (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY)
  ) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config();
  } catch {
    // dotenv is optional in managed runtimes
  }
  envLoaded = true;
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;
  if (!url) throw new Error("COZE_SUPABASE_URL is not set");
  if (!anonKey) throw new Error("COZE_SUPABASE_ANON_KEY is not set");
  return { url, anonKey };
}

/**
 * Supabase is an identity provider for DataBridge, not the migration target.
 * This client never escalates to a service-role key.
 */
function getSupabaseClient(token?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    global: token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
    db: { timeout: 60000 },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export {
  loadEnv,
  getSupabaseCredentials,
  getSupabaseClient,
};
