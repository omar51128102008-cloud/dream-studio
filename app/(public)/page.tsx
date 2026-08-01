import "../landing.css";
import CursorRing from "@/components/CursorRing";
import ScrollRing from "@/components/ScrollRing";
import Nav from "@/components/Nav";
import RevealObserver from "@/components/RevealObserver";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <CursorRing />
      <ScrollRing />
      <Nav />
      <RevealObserver />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
