import env from "./env.js";

let supabase = null;

export function getSupabase() {
  if (supabase) return supabase;

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.warn(
      "⚠️  Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env",
    );
    return null;
  }

  return import("@supabase/supabase-js").then(({ createClient }) => {
    supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
    return supabase;
  });
}

export default getSupabase;
