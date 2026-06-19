import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // Surfaced once at boot — keeps the rest of the app from crashing with cryptic errors.

  console.warn(
    "[necepies] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. The app will run, but data calls will fail until you add them to .env.",
  );
}

export const supabase = createClient(url ?? "http://localhost", anon ?? "anon", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "necepies-auth",
  },
});

export const isSupabaseConfigured = Boolean(url && anon);
