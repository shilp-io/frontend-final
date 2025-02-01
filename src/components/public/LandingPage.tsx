"use client";
import { Navbar } from "@/components/ui/landingpage/navbar";
import { Hero } from "@/components/ui/landingpage/hero";
import { Features } from "@/components/ui/landingpage/features";
import { HowItWorks } from "@/components/ui/landingpage/how-it-works";
import { TimeSavingEdge } from "@/components/ui/landingpage/time-saving-edge";
import { Industries } from "@/components/ui/landingpage/industries";
import { Testimonials } from "@/components/ui/landingpage/testimonials";
import { CTA } from "@/components/ui/landingpage/cta";
import { Footer } from "@/components/ui/landingpage/footer";
import { AbstractBackground } from "@/components/ui/landingpage/abstract-background";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#B5B5B5] relative">
      <div className="relative z-10">
        <Navbar />
        <main className="space-y-64">
          <Hero />
          <div className="section-divider">
            <Features />
          </div>
          <HowItWorks />
          <TimeSavingEdge />
          <div className="section-divider">
            <Industries />
          </div>
          <Testimonials />
          <div className="section-divider">
            <CTA />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
