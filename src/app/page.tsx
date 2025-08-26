"use client";
import FeaturesOverview from "@/components/minicomponents/Home/Feature";
import HeroSection from "@/components/minicomponents/Home/Hero";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesOverview />
    </div>
  );
}