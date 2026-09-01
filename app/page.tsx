import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Domains } from "@/components/Domains";
import { Projects, type SiteProject } from "@/components/Projects";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { getProjects } from "@/lib/project";

export const dynamic = "force-dynamic";

export default async function Home() {
  let projects: SiteProject[] = [];
  try {
    projects = await getProjects();
  } catch {
    projects = [];
  }

  return (
    <>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Domains />
        <About />
        <Projects projects={projects} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}