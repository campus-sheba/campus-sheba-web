/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import HeroSection from '../components/HeroSection';
import FAQSection from '../components/FAQSection';
import Banners from '../components/Banners';
import CampusFeaturesSections from '../components/CampusFeaturesSections';
import CampusServiceComponents from '../components/CampusServiceComponents';

interface HomeTemplateProps {
  t: (key: string) => string;
}

const HomeTemplate: React.FC<HomeTemplateProps> = ({ t }: HomeTemplateProps) => {
  return (
    <div>
      <HeroSection />
      <Banners />
     
      <CampusFeaturesSections />
      
      <CampusServiceComponents />
      <FAQSection />
      {/* <CampusMap /> */}
      {/* <SubscribeNowSection /> */}
    </div>
  );
};

export default HomeTemplate;
