'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import HomeTemplate from './templates/HomeTemplate';

const HomePage = () => {
  const t = useTranslations('HomePage');
  return <HomeTemplate t={t} />;
};

export default HomePage;
