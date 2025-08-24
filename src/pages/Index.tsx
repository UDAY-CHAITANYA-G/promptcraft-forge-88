import React from 'react'
import { HeroSection } from '@/components/HeroSection'
import { FrameworkSelection } from '@/components/FrameworkSelection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FrameworkSelection />
      <Footer />
    </div>
  );
};

export default Index;
