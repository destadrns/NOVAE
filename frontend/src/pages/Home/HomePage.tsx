import React from 'react';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { BrandManifesto } from '@/components/manifesto/BrandManifesto';
import { CollectionsShowcase } from '@/components/collections/CollectionsShowcase';
import { CampaignStory } from '@/components/campaign/CampaignStory';
import { NewDrop } from '@/components/products/NewDrop';
import { MoveYourWay } from '@/components/signature/MoveYourWay';
import { StyleFinderTeaser } from '@/components/style-finder/StyleFinderTeaser';
import { JournalSection } from '@/components/journal/JournalSection';
import { FinalCTA } from '@/components/cta/FinalCTA';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 01: Hero */}
      <CinematicHero />

      {/* 02: Brand Manifesto */}
      <BrandManifesto />

      {/* 03: The Collection Showcase */}
      <CollectionsShowcase />

      {/* 04: Campaign Story */}
      <CampaignStory />

      {/* 05: New Drop Product Grid */}
      <NewDrop />

      {/* 06: Signature Kinetic Move Your Way */}
      <MoveYourWay />

      {/* 07: Interactive Style Finder */}
      <StyleFinderTeaser />

      {/* 08: Editorial Journal */}
      <JournalSection />

      {/* 09: Final Call to Action */}
      <FinalCTA />
    </div>
  );
};
