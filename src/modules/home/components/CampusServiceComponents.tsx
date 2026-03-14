/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, Typography, Row, Col, Divider, Tabs } from 'antd';
import {
  UserAddOutlined,
  CompassOutlined,
  TeamOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  SearchOutlined,
  TrophyOutlined,
  SolutionOutlined,
  ShopOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// How It Works Section
export const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserAddOutlined className="text-blue-500" />,
      title: 'Sign Up',
      description: 'Create your campus account with your university email to get started.',
    },
    {
      icon: <CompassOutlined className="text-green-500" />,
      title: 'Explore',
      description: 'Discover services tailored specifically to your campus needs.',
    },
    {
      icon: <TeamOutlined className="text-purple-500" />,
      title: 'Connect',
      description: 'Interact with service providers and fellow students seamlessly.',
    },
    {
      icon: <SwapOutlined className="text-red-500" />,
      title: 'Transact',
      description: 'Buy, sell, exchange, or avail services with ease and confidence.',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <Title level={2} className="font-bold text-gray-800">
            How It <span className="text-blue-600">Works</span>
          </Title>
          <Paragraph className="mx-auto max-w-2xl text-lg text-gray-600">
            Our platform connects you with campus services in just a few simple steps
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="mt-8">
          {steps.map((step, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                className="h-full rounded-lg border-0 text-center shadow-md transition-shadow duration-300 hover:shadow-xl"
                bodyStyle={{ padding: '2rem 1rem' }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                    {step.icon}
                  </div>
                </div>
                <Title level={4} className="mb-2 font-semibold">
                  {step.title}
                </Title>
                <Paragraph className="text-gray-600">{step.description}</Paragraph>
                <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                  {index + 1}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

// Benefits & Value Proposition Section
export const BenefitsSection = () => {
  const benefitCategories = {
    students: [
      {
        icon: <DollarOutlined />,
        title: 'Save Money',
        description: 'Through peer-to-peer transactions and student discounts',
      },
      {
        icon: <SearchOutlined />,
        title: 'Find Essential Services',
        description: 'Easily discover services tailored to your campus needs',
      },
      {
        icon: <TrophyOutlined />,
        title: 'Monetize Skills',
        description: 'Turn your talents into income and build your resume',
      },
      {
        icon: <SafetyCertificateOutlined />,
        title: 'Stay Safe',
        description: 'Connect with campus-verified users for secure transactions',
      },
      {
        icon: <SolutionOutlined />,
        title: 'Emergency Support',
        description: 'Access crucial services when you need them most',
      },
    ],
    providers: [
      {
        icon: <TeamOutlined />,
        title: 'Targeted Audience',
        description: 'Reach your exact demographic without wasted marketing',
      },
      {
        icon: <TrophyOutlined />,
        title: 'Build Loyal Customer Base',
        description: 'Create lasting relationships with student clients',
      },
      {
        icon: <CompassOutlined />,
        title: 'Streamlined Operations',
        description: 'Manage all your campus business through one platform',
      },
      {
        icon: <SafetyCertificateOutlined />,
        title: 'Verified Reviews',
        description: 'Build reputation through authentic student feedback',
      },
      {
        icon: <SwapOutlined />,
        title: 'Campus Ecosystem Growth',
        description: 'Expand your services across connected campuses',
      },
    ],
    administration: [
      {
        icon: <UserAddOutlined />,
        title: 'Enhanced Student Experience',
        description: 'Provide students with valuable services they need',
      },
      {
        icon: <DollarOutlined />,
        title: 'Support Entrepreneurship',
        description: 'Foster student-led businesses and innovation',
      },
      {
        icon: <SwapOutlined />,
        title: 'Self-Sustaining Economy',
        description: 'Create an efficient marketplace within campus',
      },
      {
        icon: <SafetyCertificateOutlined />,
        title: 'Improved Emergency Response',
        description: 'Better coordinate essential services for students',
      },
      {
        icon: <TeamOutlined />,
        title: 'Community Engagement',
        description: 'Build stronger connections across campus communities',
      },
    ],
  };

  const renderBenefitCards = (benefits: any[]) => (
    <Row gutter={[24, 24]} className="mt-4">
      {benefits.map((benefit, index) => (
        <Col xs={24} sm={12} lg={8} key={index}>
          <Card
            hoverable
            className="h-full rounded-lg border-0 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-start">
              <div className="mr-4 rounded-full bg-blue-100 p-3 text-xl text-blue-600">
                {benefit.icon}
              </div>
              <div>
                <Title level={5} className="mb-2 font-bold">
                  {benefit.title}
                </Title>
                <Paragraph className="mb-0 text-gray-600">{benefit.description}</Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* <div className="mb-10 text-center">
          <Title level={2} className="font-bold">
            Benefits & <span className="text-blue-600">Value</span>
          </Title>
          <Paragraph className="mx-auto max-w-3xl text-lg text-gray-600">
            Our platform creates value for everyone in the campus ecosystem
          </Paragraph>
        </div> */}
        <div
          className={`mb-16 transform text-center transition-all duration-700 ${
            true ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-1 text-sm font-medium text-indigo-800">
            BENEFITS & VALUE
          </span>
          <Title level={2} className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Everything You Need on Campus
          </Title>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Our integrated platform brings together powerful tools designed to enhance your
            university experience
          </p>
        </div>
        <Tabs
          defaultActiveKey="students"
          centered
          className="text-lg"
          size="large"
          tabBarStyle={{ marginBottom: 32, fontWeight: 'bold' }}
        >
          <TabPane
            tab={
              <span className="inline-flex items-center px-2 py-1">
                <UserAddOutlined className="mr-2" /> For Students
              </span>
            }
            key="students"
          >
            {renderBenefitCards(benefitCategories.students)}
          </TabPane>

          <TabPane
            tab={
              <span className="inline-flex items-center px-2 py-1">
                <ShopOutlined className="mr-2" /> For Service Providers
              </span>
            }
            key="providers"
          >
            {renderBenefitCards(benefitCategories.providers)}
          </TabPane>

          <TabPane
            tab={
              <span className="inline-flex items-center px-2 py-1">
                <BankOutlined className="mr-2" /> For Campus Administration
              </span>
            }
            key="administration"
          >
            {renderBenefitCards(benefitCategories.administration)}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

// Component to import and include both sections
const CampusServiceComponents = () => {
  return (
    <div className="font-sans">
      {/* <HowItWorksSection /> */}
      <Divider style={{ margin: 0 }} />
      <BenefitsSection />
    </div>
  );
};

export default CampusServiceComponents;
