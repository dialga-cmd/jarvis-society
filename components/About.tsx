import { Reveal } from "@/components/Reveal";
import { DomainAccordion } from "@/components/DomainAccordion";

export function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-void py-28 lg:py-36"
    >
      <div className="bg-radial-fade absolute inset-0 opacity-60" />

      <div className="container-shell relative grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-5">
            <span className="text-ink-tertiary">//</span> Who we are
          </p>
          <h2 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            We are what <span className="text-accent-lit">students build</span>
          </h2>
          <div className="mt-7 space-y-5 text-lg leading-relaxed text-ink-secondary">
            <p>
              JARVIS Society is a student-run collective that treats the
              university as a launchpad. We learn in the open, ship in
              public, and hold every project to a single standard: does it
              work, and can we prove it?
            </p>
            <p>
              No gatekeeping, no silver bullets. Four domains, one culture,
              and a shared belief that the best way to learn a system is to
              break and rebuild it — deliberately, documented, and together.
            </p>
          </div>
          <ul className="mt-9 grid gap-3 font-mono text-sm text-ink-secondary sm:grid-cols-2">
            {[
              "Open source by default",
              "Ships every semester",
              "Mentored, member-run",
              "Documentation-first",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <p className="eyebrow mb-6">
            <span className="text-ink-tertiary">//</span> The four disciplines
          </p>
          <DomainAccordion />
        </Reveal>
      </div>
    </section>
  );
}