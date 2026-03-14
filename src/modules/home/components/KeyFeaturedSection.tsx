/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import {
  BookOutlined,
  ShopOutlined,
  CoffeeOutlined,
  HeartOutlined,
  GiftOutlined,
  SearchOutlined,
  AlertOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const KeyFeaturedSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Entrance animation
    setIsLoaded(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <BookOutlined style={{ fontSize: 24 }} />,
      title: 'Books Exchange',
      description: 'Buy, sell, or trade textbooks with other students on campus.',
    },
    {
      icon: <ShopOutlined style={{ fontSize: 24 }} />,
      title: 'Student Marketplace',
      description:
        'A dedicated platform for students to buy and sell items within the campus community.',
    },
    {
      icon: <CoffeeOutlined style={{ fontSize: 24 }} />,
      title: 'Campus Food Directory',
      description: 'Discover and review all food options available on and around campus.',
    },
    {
      icon: <HeartOutlined style={{ fontSize: 24 }} />,
      title: 'Blood Donation Network',
      description: 'Connect donors with blood banks and organize campus donation drives.',
    },
    {
      icon: <GiftOutlined style={{ fontSize: 24 }} />,
      title: 'Campus Delivery',
      description: 'Fast delivery services for packages and food within the campus.',
    },
    {
      icon: <SearchOutlined style={{ fontSize: 24 }} />,
      title: 'Lost & Found',
      description: 'A digital system to report and find lost items across campus.',
    },
    {
      icon: <AlertOutlined style={{ fontSize: 24 }} />,
      title: 'Emergency Help',
      description: 'Quick access to emergency services and campus security.',
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 24 }} />,
      title: 'Interactive Campus Map',
      description: 'Navigate campus with real-time directions and points of interest.',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 24 }} />,
      title: 'Student Startup Support',
      description: 'Resources and mentorship for student entrepreneurs.',
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 24 }} />,
      title: 'Event Support System',
      description: 'Tools for organizing, promoting, and managing campus events.',
    },
  ];

  // Handle next/prev for mobile carousel
  const handleNext = () => {
    setActiveIndex(prev => (prev === features.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev === 0 ? features.length - 1 : prev - 1));
  };

  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div
          className={`mb-16 transform text-center transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-800">
            KEY FEATURES
          </span>
          <Title level={2} className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Everything You Need on Campus
          </Title>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Our integrated platform brings together powerful tools designed to enhance your
            university experience
          </p>
        </div>

        {/* Desktop & Tablet: Features Grid */}
        <div className="hidden grid-cols-2 gap-6 md:grid lg:grid-cols-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group flex h-64 flex-col rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-lg ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* Icon container */}
              <div className="mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-all duration-300 group-hover:bg-gray-900 group-hover:text-white">
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-medium text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>

              {/* Link */}
              <div className="mt-auto pt-4">
                <span className="flex items-center gap-1 text-sm font-medium text-gray-900 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Learn More <ArrowRightOutlined style={{ fontSize: 12 }} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Feature Carousel */}
        <div className="relative md:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="min-w-full px-4 py-2">
                  <div className="h-60 rounded-lg border border-gray-200 bg-white p-6">
                    {/* Icon and content container */}
                    <div className="flex h-full flex-col">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        {feature.icon}
                      </div>

                      <h3 className="mb-2 text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>

                      <div className="mt-auto">
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          Learn More <ArrowRightOutlined style={{ fontSize: 12 }} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="mt-6 flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  activeIndex === index ? 'w-6 bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 justify-between px-2">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-md"
            >
              <ArrowLeftOutlined />
            </button>
            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-md"
            >
              <ArrowRightOutlined />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        {/* <div
          className={`mt-12 text-center transition-all delay-500 duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <Button
            type="primary"
            size="large"
            className="h-12 rounded-lg border-none bg-gray-900 px-8 hover:bg-gray-800"
          >
            Explore All Features
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default KeyFeaturedSection;
