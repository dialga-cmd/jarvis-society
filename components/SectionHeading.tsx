import { Reveal } from "@/components/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      <p className="eyebrow mb-5">
        <span className="text-ink-tertiary">//</span> {eyebrow}
      </p>
      <h2 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 text-lg leading-relaxed text-ink-secondary">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
