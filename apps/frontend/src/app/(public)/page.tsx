import { Metadata } from "next";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import CookieConsent from "@/components/common/CookieConsent";
import { Toaster } from "react-hot-toast";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingPreview from "@/components/landing/PricingPreview";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import "../globals.css";

export const metadata: Metadata = {
  title: "Rooster AI - AI-Powered Staff Scheduling for Hospitality",
  description:
    "Eliminate manual scheduling chaos with intelligent automation. Perfect for cafes, bars, venues, and retail businesses across Ireland and Europe.",
  keywords:
    "staff scheduling, roster management, AI automation, hospitality, Ireland, Europe",
  openGraph: {
    title: "Rooster AI - AI-Powered Staff Scheduling",
    description: "Intelligent automation for hospitality staff scheduling",
    url: "https://www.roosterai.ie",
    siteName: "Rooster AI",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-[#fafbfd]">
        <HeroSection />
        <FeaturesSection />
        <PricingPreview />
        <TestimonialsSection />
        <CTASection />
      </main>
      <PublicFooter />
      <CookieConsent />
      <Toaster position="top-right" />
    </>
  );
}
