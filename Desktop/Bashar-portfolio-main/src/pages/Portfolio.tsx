import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { Research } from "@/components/Research";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Portfolio() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Education />
        <Experience />
        <Research />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
