"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AmbientNetwork } from "@/components/AmbientNetwork";

type AuthState = "idle" | "signing-in" | "checking" | "authenticated" | "denied" | "error";

export default function AdminPage() {
  const [state, setState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const verifyingRef = useRef(false);

  const verifyAdmin = useCallback(async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setState("checking");
    try {
      const { data } = await supabaseBrowser().auth.getSession();
      const sessionEmail = data.session?.user?.email;
      // The server resolves the email from the session cookies and checks the
      // admins table itself — nothing client-supplied is trusted here.
      const res = await fetch("/api/admin/verify");
      const body = await res.json();
      if (res.ok && body.ok && body.isAdmin && sessionEmail) {
        setEmail(sessionEmail);
        setState("authenticated");
      } else {
        setState("denied");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }, []);

  // If a session already exists on load (e.g. returning admin), reflect it.
  useEffect(() => {
    (async () => {
      const { data } = await supabaseBrowser().auth.getSession();
      if (data.session?.user) await verifyAdmin();
    })();
  }, [verifyAdmin]);

  const handleGoogle = async () => {
    setState("signing-in");
    try {
      const { data, error } = await supabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;

      const popup = window.open(
        data.url,
        "jarvis-auth",
        "popup=yes,width=540,height=640"
      );
      if (!popup) {
        setErrorMsg("Popup blocked. Allow popups for this site and retry.");
        setState("error");
        return;
      }

      verifyingRef.current = false;

      // The popup writes the session to this origin's cookies when it
      // completes. Poll for it (cover for cookie storage not emitting
      // cross-tab events), and fall back to idle if the popup closes first.
      const timer = window.setInterval(async () => {
        const { data: s } = await supabaseBrowser().auth.getSession();
        if (s.session?.user) {
          window.clearInterval(timer);
          verifyingRef.current = false;
          await verifyAdmin();
          return;
        }
        if (popup.closed) {
          window.clearInterval(timer);
          verifyingRef.current = false;
          setState((prev) => (prev === "signing-in" ? "idle" : prev));
        }
      }, 400);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  };

  const handleSignOut = async () => {
    await supabaseBrowser().auth.signOut();
    setState("idle");
    setEmail("");
  };

  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black">
        {/* Same orb / particle network background as the hero */}
        <div className="pointer-events-none absolute inset-0">
          <AmbientNetwork />
        </div>

        <div className="container-shell relative z-[1] flex flex-1 flex-col items-center justify-center py-28">
          <div className="w-full max-w-md">
            <p className="eyebrow mb-5 text-center">
              <span className="text-ink-tertiary">//</span> Restricted access
            </p>
            <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-ink">
              Admin panel
            </h1>

            <div className="mt-10 rounded-card border border-hairline bg-surface p-8 text-center">
              {state === "idle" && (
                <>
                  <p className="text-[0.95rem] leading-relaxed text-ink-secondary">
                    Welcome to the backdoors of the website. To go any further,
                    let me check your authorized student id.
                  </p>

                  <button
                    type="button"
                    onClick={handleGoogle}
                    className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-void py-3 font-mono text-sm uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:border-accent-soft hover:text-ink"
                  >
                    <GoogleLogo size={18} weight="bold" />
                    Sign in with Google
                  </button>
                </>
              )}

              {state === "signing-in" && (
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-ink-secondary">
                  Redirecting to Google…
                </p>
              )}

              {state === "checking" && (
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-ink-secondary">
                  Verifying access…
                </p>
              )}

              {state === "authenticated" && (
                <>
                  <p className="text-sm text-ink-secondary">
                    Access granted. Welcome back,{" "}
                    <span className="text-ink">{email}</span>.
                  </p>
                  <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-tertiary">
                    Admin verified
                  </p>
                  <Link
                    href="/admin"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent-gradient py-3 font-mono text-sm uppercase tracking-[0.14em] text-white transition-all duration-300 hover:brightness-110"
                  >
                    Enter dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-void py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink"
                  >
                    Sign out
                  </button>
                </>
              )}

              {state === "denied" && (
                <>
                  <p className="text-[0.95rem] leading-relaxed text-ink-secondary">
                    Your student id is not authorized for this area.
                  </p>
                  <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-tertiary">
                    Contact a core lead if you believe this is wrong
                  </p>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-void py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink"
                  >
                    Try again
                  </button>
                </>
              )}

              {state === "error" && (
                <>
                  <p className="text-[0.95rem] leading-relaxed text-ink-secondary">
                    Could not verify access.
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-ink-tertiary">
                    {errorMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-void py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}