"use client";
import DeveloperPersonas from "@/components/minicomponents/Home/DeveloperPersonas";
import FeaturesOverview from "@/components/minicomponents/Home/Feature";
import Footer from "@/components/minicomponents/Home/Footer";
import HeroSection from "@/components/minicomponents/Home/Hero";
import HowItWorks from "@/components/minicomponents/Home/HowItWorks";
import ProblemStatement from "@/components/minicomponents/Home/ProblemStatement";
import TechIntegration from "@/components/minicomponents/Home/TechIntegration";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
   
    <div>
      <Navbar />
      <HeroSection />
      <ProblemStatement />
       <HowItWorks />
      <FeaturesOverview />
     
      {/* <DeveloperPersonas /> */}
      <TechIntegration />
      {/* <SuccessStories /> */}
      {/* <CommunityHighlights /> */}
      {/* <FinalCTA /> */}
      <Footer />
    </div>
  )
}