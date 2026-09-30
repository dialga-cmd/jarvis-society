import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { EventCard } from "@/components/EventsPreview";
import { getEvents, type EventRecord } from "@/lib/events";

export const metadata = {
  title: "Events & Sessions — JARVIS Society",
  description:
    "Explore all events and sessions hosted by JARVIS Society — workshops, tech talks, sessions, and more.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: EventRecord[] = [];
  let error: string | null = null;

  try {
    events = await getEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to load events:", err);
  }

  const now = Date.now();
  const upcoming = events.filter((e) => {
    if (e.end_time) return new Date(e.end_time).getTime() > now;
    if (e.start_time) return new Date(e.start_time).getTime() > now;
    return true; // unscheduled → treat as upcoming
  });
  const past = events.filter((e) => {
    if (e.end_time) return new Date(e.end_time).getTime() <= now;
    if (e.start_time) return new Date(e.start_time).getTime() <= now;
    return false;
  });

  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main className="min-h-[80dvh] pt-36 pb-20">
        <div className="container-shell">
          <p className="eyebrow mb-5">
            <span className="text-ink-tertiary">//</span> All events
          </p>
          <h1 className="text-balance max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Events & <span className="text-accent-lit">Sessions</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Browse every workshop, talk, and meetup the society has hosted or has planned.
          </p>
        </div>

        {error ? (
          <div className="container-shell mt-12">
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Could not load events
              </p>
              <p className="mt-2 break-all text-sm text-ink-secondary">{error}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="container-shell mt-16">
            <p className="max-w-md font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
              No events scheduled yet. Check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcoming.length > 0 && (
              <section className="container-shell mt-16">
                <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-brand-indigo">
                  Upcoming
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {past.length > 0 && (
              <section className="container-shell mt-20">
                <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-ink-tertiary">
                  Past events
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
