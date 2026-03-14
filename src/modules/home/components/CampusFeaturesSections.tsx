/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  BookOutlined,
  ShopOutlined,
  CoffeeOutlined,
  HeartOutlined,
  GiftOutlined,
  SearchOutlined,
  RocketOutlined,
  ToolOutlined,
  CalendarOutlined,
  //   ArrowRightOutlined,
  DollarOutlined,
  SolutionOutlined,
  ReadOutlined,
  RestOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
const { Title } = Typography;

// Example data for all sections
const sections = {
  campus_essentials: [
    {
      id: 'used_books',
      title: 'Books – Sell, Buy, Loan & Exchange',
      problem: 'Students struggle to find affordable academic and non-academic books',
      solution: 'Dedicated module for buying, selling, loaning, and exchanging books',
      benefits: 'Save money, access to course-specific materials, peer-to-peer trust',
      icon: <BookOutlined />,
      cta: ['Browse Books', 'List a Book', 'Request Loan', 'Exchange Book'],
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'used_items',
      title: 'Buy, Sell & Exchange of Daily Life Items',
      problem: 'Students have limited ways to trade used personal items affordably',
      solution: 'Trusted platform to buy, sell, or exchange everyday goods',
      benefits: 'Reduce waste, save money, peer-to-peer convenience',
      icon: <ShopOutlined />,
      cta: ['Explore Items', 'Post an Item'],
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'garbage',
      title: 'Garbage Collection Service',
      problem: 'Lack of organized garbage disposal options',
      solution: 'Campus-integrated garbage pickup service',
      benefits: 'Clean environment, eco-awareness, health improvement',
      icon: <DeleteOutlined />,
      cta: ['Request Pickup', 'Become a Collector'],
      color: 'from-gray-600 to-gray-800',
      bgColor: 'bg-gray-50',
    },
    {
      id: 'food',
      title: 'Campus Food Directory',
      problem: 'Difficulty finding affordable, hygienic food options',
      solution: 'Comprehensive directory of campus food options',
      benefits: 'Quick access to meal deals, snacks, and food stalls',
      icon: <CoffeeOutlined />,
      cta: ['Find Food Near Me', "See Today's Specials"],
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'blood',
      title: 'Blood Donation Network',
      problem: 'Emergency blood needs with no immediate support system',
      solution: 'Real-time blood donor request and alert system',
      benefits: 'Fast response in emergencies, life-saving network',
      icon: <HeartOutlined />,
      cta: ['Register as Donor', 'Request Blood'],
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'delivery',
      title: 'Campus Delivery Service',
      problem: 'Time-consuming transfers between campus locations',
      solution: 'On-campus delivery system for quick transfers',
      benefits: 'Secure, convenient delivery within university boundaries',
      icon: <GiftOutlined />,
      cta: ['Send a Parcel', 'Become a Campus Courier'],
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'lost',
      title: 'Lost & Found',
      problem: 'No reliable system for reporting or finding lost items',
      solution: 'Real-time lost and found board',
      benefits: 'Higher chance of recovery, campus-wide visibility',
      icon: <SearchOutlined />,
      cta: ['Report Lost Item', 'Check Found Items'],
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'laundry',
      title: 'Laundry Service',
      problem: 'Students struggle with time and access to clean laundry services',
      solution: 'On-demand campus laundry booking and delivery system',
      benefits: 'Convenient, hygienic, time-saving',
      icon: <RestOutlined />,
      cta: ['Book Laundry Pickup', 'View Services'],
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-50',
    },
  ],
  student_empowerment: [
    {
      id: 'tuition',
      title: 'Tuition Sheba',
      problem: 'Students find it difficult to connect with qualified tutors',
      solution: 'Matchmaking between tutors and students for academic help',
      benefits: 'Academic support, income opportunity, skill-sharing',
      icon: <ReadOutlined />,
      cta: ['Find a Tutor', 'Become a Tutor'],
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'jobs',
      title: 'Jobs & Careers',
      problem: 'Limited access to part-time, freelance or career opportunities',
      solution: 'Campus-based job listings, freelance gigs and internships',
      benefits: 'Build experience, earn money, grow network',
      icon: <SolutionOutlined />,
      cta: ['Browse Jobs', 'Post a Job'],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'fundraising',
      title: 'Fundraising Platform',
      problem: 'Lack of structured way to raise funds for causes/events',
      solution: 'Crowdfunding system for student initiatives',
      benefits: 'Raise awareness, collect donations, support ideas',
      icon: <DollarOutlined />,
      cta: ['Start a Campaign', 'Donate Now'],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'startup',
      title: 'Startup Support & Business Management',
      problem: 'Students with business ideas lack management tools',
      solution: 'Complete business management toolkit for student entrepreneurs',
      benefits: 'Order tracking, promotion, organization, growth',
      icon: <RocketOutlined />,
      cta: ['Launch Your Startup', 'Manage Your Business'],
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'skills',
      title: 'Skill Marketplace',
      problem: 'Talented students struggle to monetize their skills',
      solution: 'Campus-focused freelance marketplace',
      benefits: 'Earn money, gain experience, build portfolio',
      icon: <ToolOutlined />,
      cta: ['Offer Your Skills', 'Find Campus Talent'],
      color: 'from-cyan-500 to-sky-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'events',
      title: 'Event Support System',
      problem: 'Student groups struggle with event logistics and materials',
      solution: 'Comprehensive event support from trusted student providers',
      benefits: 'Easier event planning, access to design and logistics help',
      icon: <CalendarOutlined />,
      cta: ['Plan Your Event', 'Offer Event Services'],
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
    },
  ],
};

// Feature Card Component
type FeatureItem = {
  id: string;
  title: string;
  problem: string;
  solution: string;
  benefits: string;
  icon: React.ReactElement;
  cta: string[];
  color: string;
  bgColor: string;
};

type FeatureCardProps = {
  item: FeatureItem;
  index: number;
  isVisible: boolean;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ item, index, isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={item.id}
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border border-gray-200 ${item.bgColor} h-full p-1 shadow-lg transition-all duration-300 hover:shadow-xl`}
        style={{
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        }}
      >
        <div className="flex h-full flex-col rounded-xl bg-white p-6">
          <div
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110`}
          >
            {React.isValidElement(item.icon)
              ? React.cloneElement(item.icon as React.ReactElement<any>, {
                  style: { fontSize: 28 },
                })
              : item.icon}
          </div>
          <h3 className="mb-4 text-xl font-bold text-gray-900">{item.title}</h3>

          <div className="mb-6 flex-grow space-y-3">
            <div className="flex items-start">
              <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{item.problem}</p>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{item.solution}</p>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-500">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{item.benefits}</p>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {/* <button
              className={`flex w-full items-center justify-center rounded-xl bg-gradient-to-r ${item.color} px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg`}
            >
              {item.cta[0]} <ArrowRightOutlined style={{ marginLeft: 8, fontSize: 12 }} />
            </button>
            <button
              className={`flex w-full items-center justify-center rounded-xl border-2 border-gray-300 px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50`}
            >
              {item.cta[1]}
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Title Component
type SectionTitleProps = {
  title: string;
  subtitle: string;
  tag: string;
  isVisible: boolean;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, tag, isVisible }) => {
  return (
    <div
      className={`mb-16 transform text-center transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-1 text-sm font-medium text-indigo-800">
        {tag}
      </span>
      <Title level={2} className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
        {title}
      </Title>
      <p className="mx-auto max-w-2xl text-lg text-gray-600">{subtitle}</p>
    </div>
  );
};

const CampusFeaturesSections = () => {
  const [visibleSection, setVisibleSection] = useState({
    essentials: false,
    empowerment: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const essentialsSection = document.getElementById('campus-essentials');
      const empowermentSection = document.getElementById('student-empowerment');

      if (essentialsSection) {
        const rect = essentialsSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setVisibleSection(prev => ({ ...prev, essentials: true }));
        }
      }

      if (empowermentSection) {
        const rect = empowermentSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setVisibleSection(prev => ({ ...prev, empowerment: true }));
        }
      }
    };

    // Initialize visibility
    setTimeout(() => {
      setVisibleSection({ essentials: true, empowerment: false });
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl">
        {/* Campus Essentials Section */}
        <div id="campus-essentials" className="mb-24">
          <SectionTitle
            tag="CAMPUS ESSENTIALS"
            title="Everything You Need on Campus"
            subtitle="Our integrated platform brings together powerful tools designed to enhance your university experience"
            isVisible={visibleSection.essentials}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sections.campus_essentials.map((item, index) => (
              <FeatureCard
                key={item.id}
                item={item}
                index={index}
                isVisible={visibleSection.essentials}
              />
            ))}
          </div>
        </div>

        {/* Student Empowerment Section */}
        <div id="student-empowerment" className="">
          <SectionTitle
            tag="STUDENT EMPOWERMENT"
            title="Grow Your Skills & Opportunities"
            subtitle="Discover tools that help you develop professionally, earn income, and build valuable experience"
            isVisible={visibleSection.empowerment}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.student_empowerment.map((item, index) => (
              <FeatureCard
                key={item.id}
                item={item}
                index={index}
                isVisible={visibleSection.empowerment}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center shadow-xl">
          <h3 className="mb-4 text-2xl font-bold text-white">Ready to transform your campus experience?</h3>
          <p className="mb-6 text-lg text-indigo-100">Join thousands of students who are already benefiting from our platform.</p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-center sm:space-x-4 sm:space-y-0">
            <button className="rounded-xl bg-white px-8 py-3 text-base font-bold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50">
              Get Started Now
            </button>
            <button className="rounded-xl border-2 border-white bg-transparent px-8 py-3 text-base font-bold text-white transition-all hover:bg-indigo-700">
              Learn More
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CampusFeaturesSections;
