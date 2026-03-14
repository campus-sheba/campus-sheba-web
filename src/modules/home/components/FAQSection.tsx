import React, { useState, useEffect } from 'react';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  LockOutlined,
  UserOutlined,
  ToolOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
const { Title } = Typography;

// FAQ Categories and Questions
const faqData = {
  general: [
    {
      id: 'what-is',
      question: 'What is the Campus Services Platform?',
      answer:
        'Our Campus Services Platform is an integrated ecosystem designed specifically for university students. It brings together essential services like buying/selling books, finding tutors, campus delivery, and more in one convenient place. Think of it as your digital campus assistant that helps you save time and money while enhancing your university experience.',
    },
    {
      id: 'who-can-use',
      question: 'Who can use the Campus Services Platform?',
      answer:
        'The platform is designed primarily for university students, faculty, and staff. Anyone with a valid university email address can register and access our services. Some features may be available to the broader campus community, but core services are optimized for active students.',
    },
    {
      id: 'get-started',
      question: 'How do I get started?',
      answer:
        'Getting started is easy! Simply sign up using your university email address, complete your profile, and you will immediately have access to all platform features. We recommend exploring the Campus Essentials section first to familiarize yourself with everyday services like book exchange, campus delivery, and the food directory.',
    },
    {
      id: 'mobile-app',
      question: 'Is there a mobile app available?',
      answer:
        'Yes, our platform is available as both a responsive web application and dedicated mobile apps for iOS and Android. You can download them from the App Store or Google Play Store by searching "Campus Services Platform".',
    },
  ],
  account: [
    {
      id: 'create-account',
      question: 'How do I create an account?',
      answer: `To create an account, visit our homepage and click "Sign Up." You'll need to use your university email address for verification. Complete the registration form, verify your email, and set up your profile. The entire process takes less than 5 minutes.`,
    },
    {
      id: 'multiple-accounts',
      question: 'Can I have multiple accounts?',
      answer:
        'No, our platform allows only one account per university email address. This helps maintain trust and accountability within our campus community. If you need to use different services (like being both a tutor and a student), you can do so with different roles under the same account.',
    },
    {
      id: 'account-security',
      question: 'How is my account information kept secure?',
      answer:
        'We take security seriously. Your account is protected with industry-standard encryption, and sensitive information like payment details is never stored directly on our servers. We use two-factor authentication and regular security audits to ensure your data remains safe.',
    },
    {
      id: 'delete-account',
      question: 'How can I delete my account?',
      answer:
        'If you wish to delete your account, go to "Account Settings," scroll to the bottom, and select "Delete Account." Note that deleting your account will remove all your listings, requests, and transaction history. This action cannot be undone, so please be certain before proceeding.',
    },
  ],
  services: [
    {
      id: 'available-services',
      question: 'What services are available on the platform?',
      answer:
        'Our platform offers numerous services including: buying/selling textbooks, campus delivery, laundry services, lost & found, blood donation networking, used item exchange, tuition services, job listings, fundraising tools, startup support, skill marketplace, and event planning assistance.',
    },
    {
      id: 'service-provider',
      question: 'How do I become a service provider?',
      answer: `To offer services, go to the specific service category you're interested in (like Tuition Sheba or Campus Delivery) and click "Become a Provider" or equivalent button. You'll need to complete a profile for that specific service, including relevant skills, availability, and rates. Some services may require verification or approval before your listing goes live.`,
    },
    {
      id: 'service-quality',
      question: 'How do you ensure service quality?',
      answer:
        'We maintain service quality through our comprehensive review and rating system. After each transaction or service, users can rate their experience and leave feedback. Service providers with consistently low ratings are flagged for review and may be suspended if problems persist. Additionally, we have a verification process for certain services to ensure providers meet minimum qualifications.',
    },
    {
      id: 'request-new-service',
      question: 'Can I request a new service to be added to the platform?',
      answer: `Absolutely! We're always looking to improve and expand our offerings. To suggest a new service, go to "Help & Feedback" and select "Suggest a Feature." Provide details about your proposed service and why it would benefit the campus community. Our team reviews all suggestions and prioritizes development based on community feedback.`,
    },
  ],
  transactions: [
    {
      id: 'payment-methods',
      question: 'What payment methods are accepted?',
      answer:
        'We accept credit/debit cards, mobile banking, campus card payments, and in some cases, cash on delivery. For recurring services, you can set up automatic payments. All digital transactions are processed through secure, PCI-compliant payment gateways to ensure your financial information remains protected.',
    },
    {
      id: 'transaction-fees',
      question: 'Are there any transaction fees?',
      answer:
        'Most peer-to-peer transactions on the platform are free of charge. However, certain premium services may include a small service fee (typically 5-10%) to cover platform maintenance and security. These fees are always clearly displayed before you confirm any transaction.',
    },
    {
      id: 'refund-policy',
      question: 'What is your refund policy?',
      answer:
        'Our refund policy varies by service type. For marketplace transactions, refunds must be requested within 48 hours of receiving the item or service. For ongoing services like tutoring, you can cancel future sessions but completed sessions are non-refundable. Details specific to each service can be found in our Terms of Service.',
    },
    {
      id: 'dispute-resolution',
      question: 'How are disputes handled?',
      answer: `If you encounter an issue with a transaction, first try to resolve it directly with the other party through our in-app messaging system. If that doesn't work, you can open a formal dispute in the "Transaction History" section. Our resolution team will review the case within 48 hours and work with both parties to reach a fair solution.`,
    },
  ],
  technical: [
    {
      id: 'tech-requirements',
      question: 'What are the technical requirements for using the platform?',
      answer:
        'Our web platform works on any modern browser (Chrome, Firefox, Safari, Edge) updated within the last two years. Mobile apps require iOS 13+ or Android 8.0+. For optimal performance, we recommend a stable internet connection. Most features work with minimal data usage, but media uploads may require stronger connectivity.',
    },
    {
      id: 'data-usage',
      question: 'How much data does the platform use?',
      answer: `The platform is designed to be lightweight, using approximately 5-15MB of data for regular browsing sessions. Media-heavy features like uploading item photos will use more data. If you're concerned about data usage, you can enable "Data Saver Mode" in settings, which reduces image quality and disables auto-playing videos.`,
    },
    {
      id: 'offline-access',
      question: 'Can I use the platform offline?',
      answer:
        'Limited offline functionality is available in our mobile apps. You can view previously loaded listings and messages, but you cannot make new posts or send messages without an internet connection. Any actions taken offline will sync once you reconnect to the internet.',
    },
    {
      id: 'technical-issues',
      question: 'What should I do if I encounter technical issues?',
      answer: `If you experience technical problems, first try refreshing the page or restarting the app. If the issue persists, go to "Help & Support" and select "Report a Technical Issue." Include details about the problem, steps to reproduce it, and any error messages you've received. Our technical team typically responds within 24 hours for standard issues.`,
    },
  ],
  community: [
    {
      id: 'community-guidelines',
      question: 'What are the community guidelines?',
      answer:
        'Our community guidelines center around respect, honesty, and safety. We prohibit discriminatory language or behavior, fraudulent activities, and misrepresentation of items or services. All transactions should be conducted in good faith, and communication should remain respectful. For the complete guidelines, please visit the "Community Standards" page.',
    },
    {
      id: 'report-violation',
      question: 'How do I report a community guideline violation?',
      answer:
        'If you notice a violation of our community guidelines, please report it immediately. Click the "Report" button on the relevant listing, message, or profile, select the type of violation, and provide any necessary details. Our moderation team reviews all reports within 24 hours and takes appropriate action.',
    },
    {
      id: 'build-reputation',
      question: 'How can I build a good reputation on the platform?',
      answer:
        'Building a strong reputation comes from providing excellent service, honest listings, and timely communication. Complete your profile with accurate information and a clear photo. Respond promptly to inquiries, fulfill your commitments, and be respectful in all interactions. Positive ratings and reviews will naturally follow and boost your visibility on the platform.',
    },
    {
      id: 'campus-ambassadors',
      question: 'What is the Campus Ambassador program?',
      answer:
        'The Campus Ambassador program allows enthusiastic users to become official representatives of the platform. Ambassadors help promote services, gather feedback, and support new users. In return, they receive perks like premium features, exclusive merchandise, and resume credentials. Applications for the program open at the beginning of each semester.',
    },
  ],
};

// FAQ Item Component
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-md">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-gray-900 focus:outline-none"
      >
        <span className="text-base md:text-lg">{question}</span>
        <span className="ml-4 flex-shrink-0">
          {isOpen ? (
            <MinusOutlined className="text-indigo-600" />
          ) : (
            <PlusOutlined className="text-gray-600" />
          )}
        </span>
      </button>
      <div
        className={`transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="bg-gray-50 px-6 py-4">
          <p className="text-gray-700">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// FAQ Category Component
interface FAQCategoryProps {
  category: keyof typeof faqData;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (category: keyof typeof faqData) => void;
}

const FAQCategory: React.FC<FAQCategoryProps> = ({ category, title, icon, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={`flex cursor-pointer items-center rounded-xl px-4 py-3 transition-all ${
        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{title}</span>
    </button>
  );
};

// Main FAQ Component
const FrequentlyAskedQuestions = () => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof faqData>('general');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const faqSection = document.getElementById('faq-section');
      if (faqSection) {
        const rect = faqSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    // Initialize visibility
    setTimeout(() => {
      setIsVisible(true);
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle FAQ item open/closed
  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Define a type for FAQ categories
  type FAQCategoryKey = keyof typeof faqData;

  // Handle category click
  const handleCategoryClick = (category: FAQCategoryKey) => {
    setActiveCategory(category);
    // Auto-open first item in category
    const firstItemId = faqData[category][0].id;
    setOpenItems(prev => ({
      ...prev,
      [firstItemId]: true,
    }));
  };

  // Category icons mapping
  const categoryIcons = {
    general: <AppstoreOutlined style={{ fontSize: 20 }} />,
    account: <UserOutlined style={{ fontSize: 20 }} />,
    services: <ToolOutlined style={{ fontSize: 20 }} />,
    transactions: <CreditCardOutlined style={{ fontSize: 20 }} />,
    technical: <LockOutlined style={{ fontSize: 20 }} />,
    community: <TeamOutlined style={{ fontSize: 20 }} />,
  };

  // Category titles mapping
  const categoryTitles = {
    general: 'General',
    account: 'Account',
    services: 'Services',
    transactions: 'Billing & Payments',
    technical: 'Technical Support',
    community: 'Community',
  };

  return (
    <div id="faq-section" className="py-20">
      <div
        className={`mx-auto max-w-7xl transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* FAQ Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-1 text-sm font-medium text-indigo-800">
            SUPPORT CENTER
          </span>
          <Title level={2} className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Frequently Asked Questions
          </Title>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Everything you need to know about the campus services platform and billing. Can&apos;t
            find the answer you&apos;re looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Content */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-2">
              {Object.keys(faqData).map(category => {
                const typedCategory = category as keyof typeof faqData;
                return (
                  <FAQCategory
                    key={typedCategory}
                    category={typedCategory}
                    title={categoryTitles[typedCategory]}
                    icon={categoryIcons[typedCategory]}
                    isActive={activeCategory === typedCategory}
                    onClick={handleCategoryClick}
                  />
                );
              })}

              {/* Help Box */}
              <div className="mt-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
                <QuestionCircleOutlined style={{ fontSize: 24 }} className="mb-4" />
                <h4 className="mb-2 text-xl font-bold">Still need help?</h4>
                <p className="mb-4 text-indigo-100">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                </p>
                <button className="w-full rounded-lg bg-white px-4 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-50">
                  <a href="mailto:campusheba24@gmail.com">Contact Support</a>
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              {/* Category Title */}
              <div className="mb-6 flex items-center">
                {categoryIcons[activeCategory]}
                <h3 className="ml-3 text-2xl font-bold text-gray-900">
                  {categoryTitles[activeCategory]} Questions
                </h3>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {faqData[activeCategory].map(item => (
                  <FAQItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    isOpen={!!openItems[item.id]}
                    onClick={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyAskedQuestions;
