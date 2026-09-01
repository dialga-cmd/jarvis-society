"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// OAuth callback used when signing in from a popup. Supabase exchanges the
// code for a session here (same origin), then the popup closes and the admin
// page's onAuthStateChange listener picks up the fresh session. If opened
// outside a popup, fall back to a full navigation to /admin.
export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        await supabaseBrowser().auth.getSession();
      } catch {
        // Ignore — window will close regardless.
      }
      if (window.opener) {
        window.close();
      } else {
        window.location.replace("/admin");
      }
    })();
  }, []);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-ink-secondary">
        Finalizing sign-in…
      </p>
    </main>
  );
}