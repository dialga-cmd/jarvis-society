import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Domains } from "@/components/Domains";
import { EventsPreview } from "@/components/EventsPreview";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { getEvents, type EventRecord } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: EventRecord[] = [];
  try {
    events = await getEvents();
  } catch {
    events = [];
  }

  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Domains />
        <About />
        <EventsPreview events={events} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}