import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PlaygroundModel } from "@/components/PlaygroundModel";

export const metadata = {
  title: "Playground — JARVIS Society",
  description:
    "Interact with the JARVIS Society mark — a metallic indigo model you can rotate and explore.",
};

export default function PlaygroundPage() {
  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black">
        <div className="container-shell flex flex-1 flex-col items-center justify-center py-28 text-center">
          <p className="eyebrow">Playground</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,6vw,4rem)] font-bold tracking-[-0.02em] text-ink">
            Explore JARVIS
          </h1>
          <p className="mt-4 font-mono text-[0.8rem] uppercase tracking-[0.3em] text-ink-secondary">
            Drag to rotate
          </p>

          <div className="mt-10 h-[58vh] w-full max-w-3xl">
            <PlaygroundModel />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
