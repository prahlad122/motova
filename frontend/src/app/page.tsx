import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Metrics from "@/components/landing/Metrics";
import Features from "@/components/landing/Features";
import Services from "@/components/landing/Services";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Metrics />
        <Features />
        <Services />
        <Testimonials />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}