import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    client = createBrowserClient(url, key);
  }
  return client;
}

// Reset singleton on hot reload in development
if (process.env.NODE_ENV === "development" && typeof module !== "undefined") {
  // @ts-expect-error HMR cleanup
  if (module.hot) { module.hot.dispose(() => { client = null; }); }
}
