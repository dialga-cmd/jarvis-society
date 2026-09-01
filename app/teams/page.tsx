import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { TeamPageContent } from "@/components/TeamPageContent";
import { getCoreMembers } from "@/lib/core";
import type { CoreMember } from "@/lib/core";

export const metadata = {
  title: "Core Team — JARVIS Society",
  description:
    "The people behind JARVIS Society — the leads and core members running each department.",
};

// Data changes as the society grows, so always render fresh (no static cache).
export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  let members: CoreMember[] = [];
  let error: string | null = null;

  try {
    members = await getCoreMembers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to load core team:", err);
  }

  return (
    <>
      <ScrollProgress />
      <Navigation />
      <TeamPageContent members={members} error={error} />
      <Footer />
    </>
  );
}