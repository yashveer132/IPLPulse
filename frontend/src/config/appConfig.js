const appConfig = {
  appName: "IPLPulse",
  appTagline: "The Ultimate IPL Guide",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};

export default appConfig;
