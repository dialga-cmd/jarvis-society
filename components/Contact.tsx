import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { contactMeta, socialLinks } from "@/lib/site";

export function Contact() {
  const EmailIcon = contactMeta.emailIcon;

  return (
    <section id="contact" className="relative overflow-hidden bg-void py-28 lg:py-40">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_100%,black,transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

      <div className="container-shell relative text-center">
        <Reveal align="center">
          <p className="eyebrow mb-6">
            <span className="text-ink-tertiary">[</span> Transmission open{" "}
            <span className="text-ink-tertiary">]</span>
          </p>
          <h2 className="mx-auto max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Ready to <span className="text-accent-lit">build</span>?
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Join a society that ships. We&apos;re remote-first and part of the
            IIT Madras BS program — bring your curiosity, and we&apos;ll handle
            the soldering irons, the sandboxes, and the version control.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12">
            <Link
              href={`mailto:${contactMeta.email}`}
              className="inline-flex items-center gap-3 rounded-full bg-brand-indigo px-9 py-4 text-base font-semibold text-[#0c0c30] shadow-[0_12px_40px_-8px_rgba(11,27,63,0.7)] transition-all duration-300 ease-out-expo hover:brightness-125 active:scale-[0.98]"
            >
              <EmailIcon size={20} weight="bold" />
              Reach Us
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-14 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-white/10" />
            <ul className="flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[rgba(13,14,20,0.5)] text-ink-secondary transition-all duration-300 hover:border-accent-soft hover:text-ink hover:brightness-110"
                      aria-label={s.label}
                    >
                      <Icon size={18} weight="duotone" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <span className="h-px w-10 bg-white/10" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}