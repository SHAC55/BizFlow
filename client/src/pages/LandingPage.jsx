import React from "react";
import LandingHeader from "../components/LandingHeader";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Pricing from "../components/Pricing";
import Testonomail from "../components/Testonomail";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-w-[375px] w-screen">
      <LandingHeader />
      <HeroSection />
      <Features />
      <Testonomail />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;