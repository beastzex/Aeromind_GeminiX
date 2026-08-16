'use client';

import { useEffect } from 'react';
import { HomeNavbar } from '@/components/HomeNavbar';
import { AirplaneWindowHero } from '@/components/AirplaneWindowHero';
import { OverviewSection } from '@/components/OverviewSection';
import { MediaShowcaseSection } from '@/components/MediaShowcaseSection';
import { FeaturesShowcase } from '@/components/FeaturesShowcase';
import { AboutUsSection } from '@/components/AboutUsSection';
import { TechStackSection } from '@/components/TechStackSection';
import { Footer } from '@/components/Footer';
import { subscribeVoiceAction } from '@/lib/voiceNav/actionBus';

export default function Home() {
  useEffect(() => {
    return subscribeVoiceAction((action) => {
      if (action.type === 'scrollToSection') {
        document.getElementById(action.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  return (
    <main className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 min-h-screen">
      <HomeNavbar />
      <AirplaneWindowHero />
      <OverviewSection />
      <MediaShowcaseSection />
      <AboutUsSection />
      <FeaturesShowcase />
      <TechStackSection />
      <Footer />
    </main>
  );
}
