import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Domains } from "@/components/Domains";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Domains />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}