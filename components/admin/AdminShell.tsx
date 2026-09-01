"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Stack,
  UsersThree,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { supabaseBrowser } from "@/lib/supabase-browser";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: SquaresFour },
  { href: "/admin/projects", label: "Projects", icon: Stack },
  { href: "/admin/team", label: "Team", icon: UsersThree },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const current =
    NAV.find((n) => n.href !== "/admin" && pathname.startsWith(n.href)) ??
    NAV.find((n) => n.href === pathname) ??
    NAV[0];

  const handleSignOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#0D0E11] text-ink">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b border-white/[0.06] bg-[#14151A] md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-3 px-6 py-6"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-void">
            <span className="font-display text-sm font-semibold tracking-tight text-ink">
              J
            </span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold uppercase tracking-tight text-ink">
              Jarvis
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-tertiary">
              Admin
            </p>
          </div>
        </Link>

        {/* Nav */}
        <p className="px-6 pb-2 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink-tertiary">
          Manage
        </p>
        <nav className="flex flex-col gap-1 px-3 pb-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm tracking-wide transition-colors duration-200 ${
                  active
                    ? "bg-white/[0.06] text-ink"
                    : "text-ink-secondary hover:bg-white/[0.03] hover:text-ink"
                }`}
              >
                <Icon
                  size={18}
                  weight={active ? "fill" : "regular"}
                  className={active ? "text-brand-indigo" : "text-ink-tertiary"}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-indigo" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-mono text-sm text-ink-tertiary transition-colors duration-200 hover:bg-white/[0.03] hover:text-ink"
          >
            <SignOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-white/[0.06] bg-[#0D0E11]/85 px-8 backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
            <span className="text-brand-indigo">//</span> Admin
            <span className="mx-2 text-white/20">/</span>
            {current.label}
          </p>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}