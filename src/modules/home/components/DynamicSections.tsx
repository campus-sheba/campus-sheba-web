/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ShoppingBag,
  Utensils,
  GraduationCap,
  MapPin,
  Heart,
  Briefcase,
  ArrowRight,
  Star,
  Clock,
  ChevronRight,
  User,
  CircleDollarSign,
  Flame,
  Droplets,
  Package,
  Trash2,
  Bike,
  AlertCircle,
  Search,
  BadgeCheck,
  TrendingUp,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Tag,
  CalendarDays,
  Phone,
  Building2,
  DollarSign,
  Users,
  Gift,
  Volume2,
  Bookmark,
  Eye,
  ThumbsUp,
  Share2,
  Trophy,
  Target,
  Store,
  PenTool,
  Palette,
  Sparkles,
  Dumbbell,
  Smartphone,
} from "lucide-react";

// Intersection Observer Hook
function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// Reusable Section Wrapper
function Section({
  children,
  className = "",
  id = "",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <section
      ref={ref}
      id={id}
      style={{
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
      }}
      className={className}
    >
      {children}
    </section>
  );
}

// Reusable Section Header
function SectionHeader({
  tag,
  title,
  subtitle,
  center = false,
  linkAction,
  linkHref = "#",
}: {
  tag: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
  linkAction?: string;
  linkHref?: string;
}) {
  return (
    <div
      className={`mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 ${center ? "text-center md:items-center" : ""}`}
    >
      <div className={center ? "mx-auto text-center" : ""}>
        <span className="section-tag mb-3 inline-flex text-[10px] md:text-xs">
          {tag}
        </span>
        <h2 className="section-heading text-2xl md:text-3xl mt-2 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p
            className={`section-subheading text-sm md:text-base ${center ? "mx-auto" : ""}`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {linkAction && (
        <Link
          href={linkHref}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 text-brand-green-DEFAULT hover:text-brand-green-700 ${center ? "mx-auto" : ""}`}
        >
          {linkAction} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ─── 1. FOOD EXPLORE & TRENDING ─────────────────────────────────────────────
const MOCK_FOODS = [
  {
    id: 1,
    name: "Kacchi Bhai",
    type: "Restaurant",
    rating: 4.8,
    distance: "1.2 km",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    tag: "Trending",
  },
  {
    id: 2,
    name: "Cafe 360",
    type: "Fast Food",
    rating: 4.5,
    distance: "0.5 km",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Juice Bar",
    type: "Beverages",
    rating: 4.9,
    distance: "200 m",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Sultan's Dine",
    type: "Biryani",
    rating: 4.7,
    distance: "3.5 km",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    tag: "Popular",
  },
];

export function FoodExploreSection({ locale = "en" }: { locale?: string }) {
  return (
    <Section className="py-16 bg-white" id="food-explore">
      <div className="cs-container">
        <SectionHeader
          tag="Food Delivery"
          title={
            <>
              <span className="text-mod-delivery">Discover</span> Campus Dining
            </>
          }
          subtitle="Explore trending restaurants and hidden gems near your university."
          linkAction="View All Restaurants"
          linkHref={`/food`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_FOODS.map((food, i) => (
            <div
              key={food.id}
              className="card overflow-hidden group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative h-40 overflow-hidden bg-neutral-100">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {food.tag && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-[10px] font-bold text-mod-delivery shadow-sm flex items-center gap-1 uppercase tracking-wide">
                    <Flame className="w-3 h-3 text-orange-500" /> {food.tag}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-lg text-brand-navy-DEFAULT">
                    {food.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm font-semibold text-brand-navy-DEFAULT">
                    <Star className="w-3.5 h-3.5 fill-brand-amber-DEFAULT text-brand-amber-DEFAULT" />{" "}
                    {food.rating}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                  <span>{food.type}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {food.distance}
                  </span>
                </div>
                <button className="w-full py-2 rounded-lg bg-neutral-100 text-sm font-semibold text-brand-navy-DEFAULT hover:bg-mod-delivery hover:text-white transition-colors">
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 2. BOOKS RENT/SELL/BUY ──────────────────────────────────────────────────
const MOCK_BOOKS = [
  {
    id: 1,
    title: "Calculus Early Transcendentals",
    author: "James Stewart",
    type: "Rent",
    price: "৳50/week",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200",
    condition: "Good",
  },
  {
    id: 2,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    type: "Sell",
    price: "৳1200",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200",
    condition: "Like New",
  },
  {
    id: 3,
    title: "Physics for Scientists",
    author: "Serway & Jewett",
    type: "Sell",
    price: "৳800",
    image:
      "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80&w=200",
    condition: "Acceptable",
  },
];

export function BooksSection() {
  return (
    <Section className="py-16 bg-neutral-50" id="books">
      <div className="cs-container">
        <SectionHeader
          tag="Book Sheba"
          title={
            <>
              <span className="text-mod-books">Study Smart.</span> Rent & Buy
              Books
            </>
          }
          subtitle="Find your course materials cheaper and faster from seniors and batchmates."
          linkAction="Browse Books"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_BOOKS.map((book) => (
            <div
              key={book.id}
              className="card p-4 flex gap-4 hover:-translate-y-1 transition-transform"
            >
              <div className="w-24 h-32 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0 relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-brand-navy-DEFAULT text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                  {book.type}
                </div>
              </div>
              <div className="flex flex-col flex-1 py-1">
                <h3 className="font-display font-semibold text-base leading-tight mb-1 text-brand-navy-DEFAULT line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-neutral-500 mb-2">{book.author}</p>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wide">
                      Condition: {book.condition}
                    </p>
                    <p className="font-bold text-mod-books text-lg">
                      {book.price}
                    </p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-mod-books/10 text-mod-books flex items-center justify-center hover:bg-mod-books hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 3. BUY & SELL POSTS ────────────────────────────────────────────────────
const MOCK_MARKET = [
  {
    id: 1,
    title: "Dell XPS 15 - Core i7",
    price: "৳85,000",
    time: "2 hours ago",
    user: "Rahim U.",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  },
  {
    id: 2,
    title: "IKEA Table Lamp",
    price: "৳800",
    time: "5 hours ago",
    user: "Sadia A.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
  },
  {
    id: 3,
    title: "Scientific Calculator Casio fx-991EX",
    price: "৳1,200",
    time: "1 day ago",
    user: "Tanvir H.",
    image:
      "https://images.unsplash.com/photo-1594980596821-ce51fde20e0d?w=500&q=80",
  },
  {
    id: 4,
    title: "Acoustic Guitar - Yamaha F310",
    price: "৳9,500",
    time: "2 days ago",
    user: "Faisal M.",
    image:
      "https://images.unsplash.com/photo-1517482813589-980bd32bdeb2?w=500&q=80",
  },
];

export function MarketplaceSection() {
  return (
    <Section className="py-16 bg-white" id="marketplace">
      <div className="cs-container">
        <SectionHeader
          tag="Marketplace"
          title={
            <>
              Campus <span className="text-mod-sell">Buy & Sell</span>
            </>
          }
          subtitle="Pre-loved electronics, furniture, and student essentials up for grabs."
          linkAction="Go to Marketplace"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {MOCK_MARKET.map((item) => (
            <div
              key={item.id}
              className="card group cursor-pointer overflow-hidden border border-neutral-100 hover:border-mod-sell/30 transition-colors"
            >
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.time}
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-sm md:text-base text-brand-navy-DEFAULT mb-1 truncate">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-mod-sell text-sm md:text-base">
                    {item.price}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-neutral-500">
                    <User className="w-3 h-3" /> {item.user}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 4. TUITION SECTION ─────────────────────────────────────────────────────
const MOCK_TUITION = [
  {
    id: 1,
    subject: "A-Level Physics & Math",
    location: "Gulshan (Home Tutoring)",
    salary: "৳8,000/mo",
    days: "3 days/week",
    author: "Parent",
    posted: "1hr ago",
  },
  {
    id: 2,
    subject: "Class 9 & 10 All Subjects",
    location: "Banani (Online)",
    salary: "Negotiable",
    days: "4 days/week",
    author: "Student",
    posted: "4hrs ago",
  },
  {
    id: 3,
    subject: "IELTS Preparation",
    location: "Dhanmondi",
    salary: "৳10,000/course",
    days: "Flexible",
    author: "Institute",
    posted: "1 day ago",
  },
];

export function TuitionSection() {
  return (
    <Section
      className="py-16 bg-mod-tuition/5 relative overflow-hidden"
      id="tuition"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-mod-tuition/10 rounded-full blur-3xl" />
      <div className="cs-container relative">
        <SectionHeader
          tag="Tuition Sheba"
          title={
            <>
              <span className="text-mod-tuition">Find</span> Tuition Jobs
            </>
          }
          subtitle="Connect with students and parents looking for qualified tutors."
          linkAction="View All Tuition Posts"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TUITION.map((job) => (
            <div
              key={job.id}
              className="card p-5 border-l-4 border-l-mod-tuition hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="badge bg-mod-tuition/10 text-mod-tuition border border-mod-tuition/20">
                  {job.author}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {job.posted}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg text-brand-navy-DEFAULT mb-4 bg-clip-text h-[50px]">
                {job.subject}
              </h3>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-mod-tuition" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CircleDollarSign className="w-4 h-4 text-mod-tuition" />{" "}
                  <span className="font-semibold text-brand-navy-DEFAULT">
                    {job.salary}
                  </span>{" "}
                  ({job.days})
                </div>
              </div>
              <button className="w-full py-2.5 rounded-lg border border-mod-tuition text-sm font-semibold text-mod-tuition hover:bg-mod-tuition hover:text-white transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 5. LOST & FOUND ────────────────────────────────────────────────────────
const MOCK_LOST = [
  {
    id: 1,
    type: "Lost",
    title: "Black Wallet with ID Cards",
    location: "Central Library",
    time: "Today, 10:30 AM",
    reward: "Yes",
    icon: MapPin,
  },
  {
    id: 2,
    type: "Found",
    title: "Apple AirPods Pro",
    location: "Cafeteria Ground Floor",
    time: "Yesterday, 2:15 PM",
    reward: null,
    icon: CheckCircle,
  },
];

function CheckCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function LostFoundSection() {
  return (
    <Section className="py-16 bg-white" id="lost-found">
      <div className="cs-container">
        <SectionHeader
          tag="Lost & Found"
          title={
            <>
              Recent <span className="text-mod-lost">Lost & Found</span>
            </>
          }
          subtitle="Help the community by reporting found items or searching for lost ones."
          linkAction="Report an Item"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_LOST.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-mod-lost/30 transition-colors"
            >
              <div
                className={`w-16 h-16 rounded-full flex flex-shrink-0 items-center justify-center ${item.type === "Lost" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
              >
                <item.icon className="w-7 h-7" />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-brand-navy-DEFAULT">
                    {item.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-max mx-auto sm:mx-0 ${item.type === "Lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mb-2">
                  {item.location} •{" "}
                  <span className="text-neutral-400">{item.time}</span>
                </p>
                {item.reward && (
                  <p className="text-xs font-semibold text-mod-lost">
                    🏆 Reward Offered
                  </p>
                )}
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold hover:bg-neutral-50 transition-colors w-full sm:w-auto">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 6. DONATION & JOBS SIDE-BY-SIDE ────────────────────────────────────────
export function DonationAndJobsSection() {
  return (
    <Section className="py-16 bg-neutral-50">
      <div className="cs-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Donation */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-mod-donation/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <span className="section-tag bg-mod-donation/10 text-mod-donation border-mod-donation/20 mb-2 inline-flex text-[10px]">
                  Social Cause
                </span>
                <h3 className="text-2xl font-display font-bold text-brand-navy-DEFAULT">
                  Fundraisers
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-mod-donation/10 flex items-center justify-center text-mod-donation">
                <Heart className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="space-y-6 relative z-10">
              {/* Campaign 1 */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-brand-navy-DEFAULT">
                    Medical Help for Campus Guard
                  </h4>
                  <span className="text-xs font-bold text-mod-donation">
                    75%
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-mod-donation rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500 text-right">
                  Raised ৳37,500 of ৳50,000
                </p>
              </div>
              {/* Campaign 2 */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-brand-navy-DEFAULT">
                    Winter Clothes for Orphanage
                  </h4>
                  <span className="text-xs font-bold text-mod-donation">
                    40%
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-mod-donation rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500 text-right">
                  Raised ৳8,000 of ৳20,000
                </p>
              </div>
            </div>
            <button className="mt-8 w-full py-3 rounded-xl bg-mod-donation text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors relative z-10">
              Donate Now <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Jobs & Gigs */}
          <div className="bg-brand-navy-DEFAULT rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden text-white">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-mod-jobs/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <span className="section-tag bg-mod-jobs/20 text-blue-300 border-mod-jobs/30 mb-2 inline-flex text-[10px]">
                  Part-Time & Gigs
                </span>
                <h3 className="text-2xl font-display font-bold">Latest Jobs</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {[
                {
                  r: "Campus Ambassador",
                  c: "Daraz Bangladesh",
                  t: "Part-time",
                },
                { r: "Event Volunteer", c: "TechFest 2024", t: "Gig" },
                { r: "Graphic Designer", c: "Student Union", t: "Freelance" },
              ].map((job, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div>
                    <h4 className="font-semibold text-sm group-hover:text-blue-300 transition-colors">
                      {job.r}
                    </h4>
                    <p className="text-xs text-white/50 mt-1">{job.c}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                    {job.t}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 rounded-xl bg-white text-brand-navy-DEFAULT font-semibold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors relative z-10">
              Explore More Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── 7. TRENDING SHOPS & RESTAURANTS ─────────────────────────────────────────
const MOCK_SHOPS = [
  {
    id: 1,
    name: "Kacchi Bhai",
    category: "Biryani",
    rating: 4.9,
    reviews: 312,
    distance: "1.2 km",
    deliveryTime: "25-35 min",
    price: "৳৳",
    tag: "🔥 Trending",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80",
    open: true,
  },
  {
    id: 2,
    name: "Green Bowl",
    category: "Healthy Food",
    rating: 4.7,
    reviews: 198,
    distance: "0.4 km",
    deliveryTime: "15-20 min",
    price: "৳",
    tag: "🌱 Popular",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
    open: true,
  },
  {
    id: 3,
    name: "The Coffee Lab",
    category: "Café & Bakery",
    rating: 4.8,
    reviews: 445,
    distance: "300 m",
    deliveryTime: "10-15 min",
    price: "৳৳",
    tag: "☕ Top Rated",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
    open: true,
  },
  {
    id: 4,
    name: "Sultan's Dine",
    category: "Bangladeshi",
    rating: 4.6,
    reviews: 267,
    distance: "3.5 km",
    deliveryTime: "40-50 min",
    price: "৳৳৳",
    tag: "👑 Premium",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=500&q=80",
    open: false,
  },
  {
    id: 5,
    name: "Noodle Box",
    category: "Asian Fusion",
    rating: 4.5,
    reviews: 134,
    distance: "0.8 km",
    deliveryTime: "20-30 min",
    price: "৳",
    tag: "",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80",
    open: true,
  },
  {
    id: 6,
    name: "Burger Factory",
    category: "Fast Food",
    rating: 4.4,
    reviews: 289,
    distance: "1.5 km",
    deliveryTime: "20-25 min",
    price: "৳৳",
    tag: "🍔 New",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    open: true,
  },
];

const SHOP_CATEGORIES = [
  "All",
  "Biryani",
  "Fast Food",
  "Café",
  "Healthy",
  "Asian",
  "Bangladeshi",
];

export function TrendingShopsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered =
    activeCategory === "All"
      ? MOCK_SHOPS
      : MOCK_SHOPS.filter((s) =>
          s.category.toLowerCase().includes(activeCategory.toLowerCase()),
        );
  return (
    <Section className="py-16 bg-neutral-50" id="trending-shops">
      <div className="cs-container">
        <SectionHeader
          tag="Food & Dining"
          title={
            <>
              Trending{" "}
              <span className="text-mod-delivery">Shops & Restaurants</span>
            </>
          }
          subtitle="Discover the most popular eateries loved by campus students this week."
          linkAction="Explore All"
          linkHref="/delivery"
        />
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat ? "bg-mod-delivery text-white border-mod-delivery" : "bg-white text-neutral-600 border-neutral-200 hover:border-mod-delivery/40"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((shop, i) => (
            <div
              key={shop.id}
              className="card overflow-hidden group cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative h-44 overflow-hidden bg-neutral-100">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {shop.tag && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold text-neutral-800 shadow-sm">
                    {shop.tag}
                  </div>
                )}
                {!shop.open && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-3 py-1 bg-black/60 text-white text-xs font-semibold rounded-full">
                      Closed Now
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-neutral-800">
                  <Star className="w-3 h-3 fill-brand-amber-DEFAULT text-brand-amber-DEFAULT" />{" "}
                  {shop.rating}{" "}
                  <span className="text-neutral-400 font-normal">
                    ({shop.reviews})
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-base text-brand-navy-DEFAULT">
                    {shop.name}
                  </h3>
                  <span className="text-sm text-neutral-400 font-medium">
                    {shop.price}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">{shop.category}</p>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {shop.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {shop.deliveryTime}
                  </span>
                  <button className="px-3 py-1.5 rounded-lg bg-mod-delivery/10 text-mod-delivery font-semibold text-[11px] hover:bg-mod-delivery hover:text-white transition-colors">
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 8. BLOOD BANK FULL REQUEST LIST ─────────────────────────────────────────
const MOCK_BLOOD_REQUESTS = [
  {
    id: 1,
    group: "A+",
    name: "Rafiqul Islam",
    hospital: "Dhaka Medical College",
    location: "Dhaka",
    urgency: "Critical",
    units: 2,
    date: "Today, 10:30 AM",
    contact: "01712-345678",
    posted: "5 min ago",
  },
  {
    id: 2,
    group: "O-",
    name: "Sumaiya Akter",
    hospital: "DMCH Blood Bank",
    location: "Dhaka",
    urgency: "Urgent",
    units: 3,
    date: "Today, 11:15 AM",
    contact: "01812-567890",
    posted: "12 min ago",
  },
  {
    id: 3,
    group: "B+",
    name: "Abdul Karim",
    hospital: "JU Medical Centre",
    location: "Jahangirnagar",
    urgency: "Normal",
    units: 1,
    date: "Today, 9:00 AM",
    contact: "01911-234567",
    posted: "23 min ago",
  },
  {
    id: 4,
    group: "AB+",
    name: "Tasnim Hossain",
    hospital: "Popular Hospital",
    location: "Chittagong",
    urgency: "Urgent",
    units: 2,
    date: "Yesterday, 8:00 PM",
    contact: "01613-456789",
    posted: "1 hr ago",
  },
  {
    id: 5,
    group: "A-",
    name: "Mamun Rashid",
    hospital: "Chittagong Medical",
    location: "Chittagong",
    urgency: "Critical",
    units: 4,
    date: "Yesterday, 6:45 PM",
    contact: "01515-678901",
    posted: "2 hrs ago",
  },
  {
    id: 6,
    group: "O+",
    name: "Ritu Khatun",
    hospital: "Square Hospital",
    location: "Dhaka",
    urgency: "Normal",
    units: 1,
    date: "2 days ago",
    contact: "01411-890123",
    posted: "2 days ago",
  },
];

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function BloodBankSection() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [activeUrgency, setActiveUrgency] = useState("All");
  const filtered = MOCK_BLOOD_REQUESTS.filter(
    (r) =>
      (activeGroup === "All" || r.group === activeGroup) &&
      (activeUrgency === "All" || r.urgency === activeUrgency),
  );
  const urgencyColor = (u: string) =>
    u === "Critical"
      ? "bg-red-100 text-red-700 border-red-200"
      : u === "Urgent"
        ? "bg-orange-100 text-orange-700 border-orange-200"
        : "bg-yellow-100 text-yellow-700 border-yellow-200";
  const bloodGroupColor = (g: string) => {
    if (g.startsWith("O")) return "#B91C1C";
    if (g.startsWith("A")) return "#DC2626";
    if (g.startsWith("B")) return "#C2410C";
    return "#7C3AED";
  };
  return (
    <Section className="py-16 bg-red-50/40" id="blood-bank">
      <div className="cs-container">
        <SectionHeader
          tag="Blood Bank"
          title={
            <>
              Active <span className="text-mod-blood">Blood Requests</span>
            </>
          }
          subtitle="Verified emergency blood requests from hospitals and patients near your campus."
          linkAction="Register as Donor"
          linkHref="/blood-bank"
        />
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${activeGroup === g ? "bg-mod-blood text-white border-mod-blood" : "bg-white text-neutral-600 border-neutral-200 hover:border-mod-blood/40"}`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-2 sm:ml-auto">
            {["All", "Critical", "Urgent", "Normal"].map((u) => (
              <button
                key={u}
                onClick={() => setActiveUrgency(u)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeUrgency === u ? "bg-brand-navy-DEFAULT text-white border-brand-navy-DEFAULT" : "bg-white text-neutral-600 border-neutral-200"}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((req, i) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-red-200 hover:shadow-md transition-all duration-200 group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center shadow-sm"
                  style={{ background: bloodGroupColor(req.group) }}
                >
                  <Droplets className="w-4 h-4 text-white mb-0.5" />
                  <span className="text-white font-extrabold text-sm leading-none">
                    {req.group}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-brand-navy-DEFAULT truncate">
                      {req.name}
                    </p>
                    <span
                      className={`badge text-[10px] flex-shrink-0 ${urgencyColor(req.urgency)}`}
                    >
                      {req.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mb-1">
                    <Building2 className="w-3 h-3 inline mr-1" />
                    {req.hospital}
                  </p>
                  <p className="text-xs text-neutral-400">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {req.location} · <Clock className="w-3 h-3 inline mr-1" />
                    {req.posted}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-red-500" />
                    {req.units} unit{req.units > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {req.date}
                  </span>
                </div>
                <a
                  href={`tel:${req.contact}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 group-hover:scale-105 transition-all duration-150"
                >
                  <Phone className="w-3 h-3" /> Respond
                </a>
              </div>
            </div>
          ))}
        </div>
        {/* Summary bar */}
        <div className="mt-8 p-5 rounded-2xl bg-brand-navy-DEFAULT flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">500+ Registered Donors</p>
              <p className="text-xs text-white/50">
                Join and save a life today
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/blood-bank"
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Register as Donor
            </Link>
            <Link
              href="/blood-bank/request"
              className="px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              Post Request
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── 9. EXPANDED BOOKS (with tabs) ───────────────────────────────────────────
const MOCK_BOOKS_ALL = [
  {
    id: 1,
    title: "Calculus Early Transcendentals",
    author: "James Stewart",
    type: "Rent",
    price: "৳50/week",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200",
    condition: "Good",
    dept: "Mathematics",
    postedBy: "Nadia K.",
  },
  {
    id: 2,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    type: "Sell",
    price: "৳1,200",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200",
    condition: "Like New",
    dept: "CSE",
    postedBy: "Rana M.",
  },
  {
    id: 3,
    title: "Physics for Scientists",
    author: "Serway & Jewett",
    type: "Sell",
    price: "৳800",
    image:
      "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?auto=format&fit=crop&q=80&w=200",
    condition: "Acceptable",
    dept: "Physics",
    postedBy: "Sara H.",
  },
  {
    id: 4,
    title: "Organic Chemistry",
    author: "Paula Bruice",
    type: "Buy",
    price: "৳600",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=200",
    condition: "Any",
    dept: "Chemistry",
    postedBy: "Fahim A.",
  },
  {
    id: 5,
    title: "Data Structures in C++",
    author: "Michael Goodrich",
    type: "Rent",
    price: "৳40/week",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    condition: "Good",
    dept: "CSE",
    postedBy: "Tania R.",
  },
  {
    id: 6,
    title: "Engineering Mathematics",
    author: "K.A. Stroud",
    type: "Sell",
    price: "৳950",
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=200",
    condition: "Very Good",
    dept: "EEE",
    postedBy: "Rafi S.",
  },
];

const TYPE_COLORS: Record<string, string> = {
  Sell: "bg-blue-600 text-white",
  Buy: "bg-brand-green-DEFAULT/90 text-white",
  Rent: "bg-amber-500 text-white",
};

export function BooksSectionExpanded() {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Sell", "Buy", "Rent"];
  const filtered =
    activeTab === "All"
      ? MOCK_BOOKS_ALL
      : MOCK_BOOKS_ALL.filter((b) => b.type === activeTab);
  return (
    <Section className="py-16 bg-neutral-50" id="books">
      <div className="cs-container">
        <SectionHeader
          tag="Book Sheba"
          title={
            <>
              <span className="text-mod-books">Buy · Sell · Rent</span>{" "}
              Textbooks
            </>
          }
          subtitle="Save up to 70% on course materials. Trade with verified campus peers."
          linkAction="Browse All Books"
          linkHref="/books"
        />
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-neutral-200 pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${activeTab === t ? "text-mod-books border-mod-books" : "text-neutral-500 border-transparent hover:text-neutral-800"}`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
            <Search className="w-3.5 h-3.5" />
            <span>Search books…</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((book, i) => (
            <div
              key={book.id}
              className="card p-4 flex gap-4 hover:-translate-y-1 transition-transform group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0 relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-0 left-0 text-[10px] font-bold px-2 py-0.5 rounded-br-lg ${TYPE_COLORS[book.type]}`}
                >
                  {book.type}
                </div>
              </div>
              <div className="flex flex-col flex-1 py-0.5">
                <h3 className="font-display font-semibold text-sm leading-tight mb-0.5 text-brand-navy-DEFAULT line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-neutral-400 mb-0.5">{book.author}</p>
                <span className="text-[10px] font-semibold text-mod-books/70 uppercase tracking-wide mb-2">
                  Dept: {book.dept}
                </span>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-neutral-400">
                      Condition: {book.condition}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {book.postedBy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-mod-books text-base">
                      {book.price}
                    </p>
                    <button className="w-7 h-7 rounded-full bg-mod-books/10 text-mod-books flex items-center justify-center group-hover:bg-mod-books group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* CTA strip */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div>
            <p className="font-semibold text-sm text-brand-navy-DEFAULT mb-1">
              Have books to sell or rent?
            </p>
            <p className="text-xs text-neutral-500">
              List your books in under 2 minutes and reach 1,000+ campus
              readers.
            </p>
          </div>
          <Link
            href="/books/list"
            className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-mod-books text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" /> List a Book
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── 10. MARKETPLACE WITH CATEGORIES ─────────────────────────────────────────
const MARKETPLACE_CATEGORIES = [
  { label: "All", icon: ShoppingBag },
  { label: "Electronics", icon: null },
  { label: "Furniture", icon: null },
  { label: "Clothing", icon: null },
  { label: "Study Tools", icon: null },
  { label: "Music", icon: null },
];
const MOCK_MARKET_ALL = [
  {
    id: 1,
    title: "Dell XPS 15 — Core i7, 16GB RAM",
    price: "৳85,000",
    category: "Electronics",
    condition: "Excellent",
    time: "2 hrs ago",
    user: "Rahim U.",
    views: 124,
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  },
  {
    id: 2,
    title: "IKEA Lerberg Desk + Chair Combo",
    price: "৳6,500",
    category: "Furniture",
    condition: "Good",
    time: "5 hrs ago",
    user: "Sadia A.",
    views: 87,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
  },
  {
    id: 3,
    title: "Casio fx-991EX Scientific Calculator",
    price: "৳1,200",
    category: "Study Tools",
    condition: "Like New",
    time: "1 day ago",
    user: "Tanvir H.",
    views: 53,
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500&q=80",
  },
  {
    id: 4,
    title: "Yamaha F310 Acoustic Guitar",
    price: "৳9,500",
    category: "Music",
    condition: "Good",
    time: "2 days ago",
    user: "Faisal M.",
    views: 201,
    image:
      "https://images.unsplash.com/photo-1517482813589-980bd32bdeb2?w=500&q=80",
  },
  {
    id: 5,
    title: "Nike Running Shoes — Size 42",
    price: "৳2,800",
    category: "Clothing",
    condition: "Lightly Used",
    time: "3 days ago",
    user: "Mitu R.",
    views: 66,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
  },
  {
    id: 6,
    title: "HP LaserJet Printer M130",
    price: "৳12,000",
    category: "Electronics",
    condition: "Good",
    time: "4 days ago",
    user: "Karim B.",
    views: 95,
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80",
  },
  {
    id: 7,
    title: "Wooden Bookshelf — 5 Tiers",
    price: "৳3,200",
    category: "Furniture",
    condition: "Good",
    time: "5 days ago",
    user: "Dola S.",
    views: 44,
    image:
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&q=80",
  },
  {
    id: 8,
    title: "UNO & Board Game Bundle",
    price: "৳950",
    category: "Study Tools",
    condition: "New",
    time: "6 days ago",
    user: "Nabila H.",
    views: 112,
    image:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&q=80",
  },
];

export function MarketplaceSectionExpanded() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered =
    activeCategory === "All"
      ? MOCK_MARKET_ALL
      : MOCK_MARKET_ALL.filter((i) => i.category === activeCategory);
  return (
    <Section className="py-16 bg-white" id="marketplace">
      <div className="cs-container">
        <SectionHeader
          tag="Campus Marketplace"
          title={
            <>
              Campus <span className="text-mod-sell">Buy & Sell</span> Board
            </>
          }
          subtitle="Pre-loved electronics, furniture, and student essentials — peer-to-peer, no middlemen."
          linkAction="Post an Ad"
          linkHref="/marketplace/new"
        />
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-hide">
          {MARKETPLACE_CATEGORIES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeCategory === label ? "bg-mod-sell text-white border-mod-sell" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-mod-sell/30"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="card group cursor-pointer overflow-hidden border border-neutral-100 hover:border-mod-sell/30 transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.time}
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] text-neutral-600 font-medium">
                  {item.condition}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-xs md:text-sm text-brand-navy-DEFAULT mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-[10px] text-neutral-400 mb-2">
                  {item.category}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-mod-sell text-sm">
                    {item.price}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <Eye className="w-3 h-3" /> {item.views}
                    <span>·</span>
                    <User className="w-3 h-3" />
                    {item.user.split(" ")[0]}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Create Post CTA */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-mod-sell/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-mod-sell/5">
          <div className="text-center sm:text-left">
            <p className="font-bold text-brand-navy-DEFAULT mb-1">
              Got something to sell?
            </p>
            <p className="text-sm text-neutral-500">
              Post your ad for free and reach thousands of campus buyers
              instantly.
            </p>
          </div>
          <Link
            href="/marketplace/post"
            className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-mod-sell text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Tag className="w-4 h-4" /> Post Free Ad
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── 11. ENTREPRENEURSHIP & CAMPUS ECOMMERCE ───────────────────────────────
const ENTREPRENEUR_CATEGORIES = [
  { name: "Food", icon: Coffee, color: "#F97316", bg: "#FFF7ED" },
  { name: "Regular Items", icon: ShoppingBag, color: "#16A34A", bg: "#ECFDF3" },
  { name: "Handicraft", icon: Palette, color: "#7C3AED", bg: "#F5F3FF" },
  { name: "Stationeries", icon: PenTool, color: "#2563EB", bg: "#EFF6FF" },
  { name: "Beauty & Health", icon: Sparkles, color: "#DB2777", bg: "#FDF2F8" },
  { name: "Fashion & Lifestyle", icon: Tag, color: "#BE123C", bg: "#FFF1F2" },
  { name: "Sports", icon: Dumbbell, color: "#0F766E", bg: "#F0FDFA" },
  { name: "Gadget", icon: Smartphone, color: "#0EA5E9", bg: "#F0F9FF" },
  { name: "Skill-Based", icon: GraduationCap, color: "#CA8A04", bg: "#FEF9C3" },
];

const ENTREPRENEUR_SHOPS = [
  {
    id: 1,
    name: "Maya Handmade Studio",
    owner: "Maya, BBA 3rd Year",
    niche: "Handicraft",
    rating: 4.9,
    products: 42,
    sales: "1.2k",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
  },
  {
    id: 2,
    name: "Campus Gadget Corner",
    owner: "Rafi, CSE 4th Year",
    niche: "Gadget",
    rating: 4.8,
    products: 87,
    sales: "2.4k",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80",
  },
  {
    id: 3,
    name: "Healthy Bites by Nitu",
    owner: "Nitu, Nutrition",
    niche: "Food",
    rating: 4.7,
    products: 28,
    sales: "890",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
  },
];

export function EntrepreneurshipSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredShops =
    activeCategory === "All"
      ? ENTREPRENEUR_SHOPS
      : ENTREPRENEUR_SHOPS.filter((shop) => shop.niche === activeCategory);

  return (
    <Section className="py-16 bg-white" id="entrepreneurship">
      <div className="cs-container">
        <SectionHeader
          tag="Entrepreneurship"
          title={
            <>
              Campus{" "}
              <span className="text-[#E30A13]">Shops & Skill Market</span>
            </>
          }
          subtitle="Students can create shops, sell products, offer skills, and run a complete mini e-commerce business on campus."
          linkAction="Create Your Shop"
          linkHref="/marketplace/shop/create"
        />

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === "All"
                ? "bg-[#E30A13] text-white border-[#E30A13]"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-[#E30A13]/40"
            }`}
          >
            <Store className="w-3.5 h-3.5" /> All
          </button>
          {ENTREPRENEUR_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                activeCategory === cat.name
                  ? "text-white border-transparent"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
              }`}
              style={
                activeCategory === cat.name
                  ? { background: cat.color }
                  : undefined
              }
            >
              <cat.icon
                className="w-3.5 h-3.5"
                style={
                  activeCategory === cat.name
                    ? { color: "#FFFFFF" }
                    : { color: cat.color }
                }
                strokeWidth={1.9}
              />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="card overflow-hidden group border border-neutral-100 hover:border-red-200 transition-colors"
            >
              <div className="h-40 overflow-hidden bg-neutral-100 relative">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-neutral-700">
                  {shop.niche}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-base text-brand-navy-DEFAULT">
                  {shop.name}
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  Owner: {shop.owner}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-brand-amber-DEFAULT text-brand-amber-DEFAULT" />{" "}
                    {shop.rating}
                  </span>
                  <span>{shop.products} products</span>
                  <span>{shop.sales} sales</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/marketplace"
                    className="flex-1 py-2 rounded-lg bg-[#E30A13] text-white text-center text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Visit Shop
                  </Link>
                  <button className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-500 flex items-center justify-center hover:border-brand-green-DEFAULT hover:text-brand-green-DEFAULT transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredShops.length === 0 && (
            <div className="md:col-span-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-sm font-semibold text-neutral-700">
                No featured shops yet in this category
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Try another tab or open your own campus shop.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-white border border-neutral-100 p-4">
              <p className="text-xs text-neutral-400 mb-1">Step 1</p>
              <p className="font-semibold text-neutral-800">
                Create shop & list products/services
              </p>
            </div>
            <div className="rounded-xl bg-white border border-neutral-100 p-4">
              <p className="text-xs text-neutral-400 mb-1">Step 2</p>
              <p className="font-semibold text-neutral-800">
                Customers search, add to cart, and place orders
              </p>
            </div>
            <div className="rounded-xl bg-white border border-neutral-100 p-4">
              <p className="text-xs text-neutral-400 mb-1">Step 3</p>
              <p className="font-semibold text-neutral-800">
                Track orders, fulfill, and grow your campus brand
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/marketplace/shop/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E30A13] text-white text-sm font-bold hover:bg-red-700 transition-colors"
            >
              <Store className="w-4 h-4" /> Open Campus Shop
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-green-DEFAULT text-brand-green-DEFAULT text-sm font-semibold hover:bg-brand-green-50 transition-colors"
            >
              Explore Products & Services
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── 12. EXPANDED TUITION SECTION ────────────────────────────────────────────
const MOCK_TUITION_ALL = [
  {
    id: 1,
    subject: "A-Level Physics & Math",
    location: "Gulshan (Home Tutoring)",
    salary: "৳8,000/mo",
    days: "3 days/week",
    author: "Parent",
    posted: "1 hr ago",
    type: "Student Needed",
    urgency: true,
  },
  {
    id: 2,
    subject: "Class 9 & 10 All Subjects",
    location: "Banani (Online)",
    salary: "Negotiable",
    days: "4 days/week",
    author: "Student",
    posted: "4 hrs ago",
    type: "Tutor Available",
    urgency: false,
  },
  {
    id: 3,
    subject: "IELTS Preparation Course",
    location: "Dhanmondi",
    salary: "৳10,000/course",
    days: "Flexible",
    author: "Institute",
    posted: "1 day ago",
    type: "Course",
    urgency: false,
  },
  {
    id: 4,
    subject: "University Calculus & Statistics",
    location: "Mirpur (In-Person)",
    salary: "৳6,000/mo",
    days: "2 days/week",
    author: "Student",
    posted: "2 days ago",
    type: "Tutor Available",
    urgency: false,
  },
  {
    id: 5,
    subject: "Arabic & Quran Recitation",
    location: "Tongi (Home)",
    salary: "৳3,500/mo",
    days: "Daily",
    author: "Parent",
    posted: "3 days ago",
    type: "Student Needed",
    urgency: true,
  },
  {
    id: 6,
    subject: "Python & Web Dev Crash Course",
    location: "Online (Zoom)",
    salary: "৳12,000/course",
    days: "Weekends",
    author: "Tutor",
    posted: "4 days ago",
    type: "Course",
    urgency: false,
  },
];

const TUITION_TYPE_COLORS: Record<string, string> = {
  "Student Needed": "bg-mod-tuition/10 text-mod-tuition border-mod-tuition/20",
  "Tutor Available": "bg-blue-50 text-blue-700 border-blue-200",
  Course: "bg-purple-50 text-purple-700 border-purple-200",
};

export function TuitionSectionExpanded() {
  const [activeType, setActiveType] = useState("All");
  const types = ["All", "Student Needed", "Tutor Available", "Course"];
  const filtered =
    activeType === "All"
      ? MOCK_TUITION_ALL
      : MOCK_TUITION_ALL.filter((t) => t.type === activeType);
  return (
    <Section
      className="py-16 bg-amber-50/40 relative overflow-hidden"
      id="tuition"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-mod-tuition/10 rounded-full blur-3xl pointer-events-none" />
      <div className="cs-container relative">
        <SectionHeader
          tag="Tuition Sheba"
          title={
            <>
              <span className="text-mod-tuition">Find</span> Tuition — Post to
              5,000+ Students
            </>
          }
          subtitle="Connect with parents, students, and institutes looking for qualified tutors."
          linkAction="View All Posts"
          linkHref="/tuition"
        />
        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeType === t ? "bg-mod-tuition text-white border-mod-tuition" : "bg-white text-neutral-600 border-neutral-200 hover:border-mod-tuition/40"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((job, i) => (
            <div
              key={job.id}
              className="card p-5 border-l-4 border-l-mod-tuition hover:-translate-y-1 transition-transform"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`badge text-[10px] ${TUITION_TYPE_COLORS[job.type]}`}
                >
                  {job.type}
                </span>
                <div className="flex items-center gap-2">
                  {job.urgency && (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {job.posted}
                  </span>
                </div>
              </div>
              <h3 className="font-display font-semibold text-base text-brand-navy-DEFAULT mb-3">
                {job.subject}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-mod-tuition flex-shrink-0" />{" "}
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CircleDollarSign className="w-4 h-4 text-mod-tuition flex-shrink-0" />{" "}
                  <span className="font-semibold text-brand-navy-DEFAULT">
                    {job.salary}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CalendarDays className="w-4 h-4 text-mod-tuition flex-shrink-0" />{" "}
                  {job.days}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-mod-tuition text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
                  Apply Now
                </button>
                <button className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-500 flex items-center justify-center hover:border-mod-tuition hover:text-mod-tuition transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Post CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
          <div>
            <p className="font-semibold text-brand-navy-DEFAULT mb-1">
              Are you a tutor? Share your expertise.
            </p>
            <p className="text-sm text-neutral-500">
              Post your tutoring ad and connect with eager students in your
              area.
            </p>
          </div>
          <Link
            href="/tuition/post"
            className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-mod-tuition text-white text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" /> Post Tuition Ad
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── 12. EXPANDED LOST & FOUND ────────────────────────────────────────────────
const MOCK_LOST_ALL = [
  {
    id: 1,
    type: "Lost",
    title: "Black Wallet with ID Cards",
    location: "Central Library, Ground Floor",
    time: "Today, 10:30 AM",
    reward: "৳500 reward",
    contact: "Rahul M.",
  },
  {
    id: 2,
    type: "Found",
    title: "Apple AirPods Pro (White Case)",
    location: "Cafeteria — Table Near Stage",
    time: "Yesterday, 2:15 PM",
    reward: null,
    contact: "Sadia A.",
  },
  {
    id: 3,
    type: "Lost",
    title: "Orange & Black Backpack",
    location: "Chemistry Building, Room 302",
    time: "Yesterday, 4:00 PM",
    reward: null,
    contact: "Farhan T.",
  },
  {
    id: 4,
    type: "Found",
    title: "Student ID Card — Ritu Khatun",
    location: "Library Parking Lot",
    time: "2 days ago",
    reward: null,
    contact: "Karim B.",
  },
  {
    id: 5,
    type: "Lost",
    title: "Blue Parker Pen Set (Gift)",
    location: "Admin Office Corridor",
    time: "2 days ago",
    reward: "Sentimental value",
    contact: "Nitu S.",
  },
  {
    id: 6,
    type: "Found",
    title: "Car Key with Honda Logo",
    location: "Sports Complex Entrance",
    time: "3 days ago",
    reward: null,
    contact: "Asif M.",
  },
];

export function LostFoundSectionExpanded() {
  const [filter, setFilter] = useState<"All" | "Lost" | "Found">("All");
  const filtered =
    filter === "All"
      ? MOCK_LOST_ALL
      : MOCK_LOST_ALL.filter((i) => i.type === filter);
  return (
    <Section className="py-16 bg-white" id="lost-found">
      <div className="cs-container">
        <SectionHeader
          tag="Lost & Found"
          title={
            <>
              Recent <span className="text-mod-lost">Lost & Found</span> Reports
            </>
          }
          subtitle="Help your campus community recover lost items and return found ones."
          linkAction="Report an Item"
          linkHref="/lost-found/report"
        />
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {(["All", "Lost", "Found"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${filter === f ? "bg-mod-lost text-white border-mod-lost" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-mod-lost/30"}`}
            >
              {f}{" "}
              {f !== "All" && (
                <span className="ml-1 text-xs">
                  {MOCK_LOST_ALL.filter((i) => i.type === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-mod-lost/30 hover:shadow-sm transition-all"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex flex-shrink-0 items-center justify-center ${item.type === "Lost" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}
              >
                {item.type === "Lost" ? (
                  <AlertCircle className="w-7 h-7" />
                ) : (
                  <BadgeCheck className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-brand-navy-DEFAULT">
                    {item.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.type === "Lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1 text-mod-lost" />
                  {item.location}
                </p>
                <p className="text-xs text-neutral-400 mb-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {item.time} · <User className="w-3 h-3 inline mr-1" />
                  {item.contact}
                </p>
                {item.reward && (
                  <p className="text-xs font-semibold text-mod-lost flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {item.reward}
                  </p>
                )}
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 hover:border-mod-lost/40 transition-colors w-full sm:w-auto text-center">
                Contact
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── 13. DONATION CAMPAIGNS ───────────────────────────────────────────────────
const MOCK_DONATIONS = [
  {
    id: 1,
    title: "Medical Help for Campus Guard Ahmed",
    desc: "Mr. Ahmed, our beloved campus guard, needs urgent kidney transplant surgery. Let's rally together.",
    raised: 37500,
    goal: 50000,
    donors: 148,
    daysLeft: 5,
    category: "Medical",
    urgent: true,
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&q=80",
  },
  {
    id: 2,
    title: "Winter Clothes Drive for Orphanage",
    desc: "Collect winter clothes and blankets for 200+ underprivileged children at Azimpur orphanage.",
    raised: 8000,
    goal: 20000,
    donors: 63,
    daysLeft: 12,
    category: "Clothing",
    urgent: false,
    image:
      "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=500&q=80",
  },
  {
    id: 3,
    title: "Flood Relief — Sylhet Victims 2024",
    desc: "Provide food packages and emergency kits to flood-affected families in Sylhet region.",
    raised: 95000,
    goal: 100000,
    donors: 512,
    daysLeft: 3,
    category: "Disaster Relief",
    urgent: true,
    image:
      "https://images.unsplash.com/photo-1547722208-9e9b34be70a9?w=500&q=80",
  },
  {
    id: 4,
    title: "Scholarship Fund for Underprivileged Students",
    desc: "Help bright but financially struggling students continue their university education.",
    raised: 22000,
    goal: 60000,
    donors: 97,
    daysLeft: 20,
    category: "Education",
    urgent: false,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&q=80",
  },
];

export function DonationSection() {
  return (
    <Section className="py-16 bg-green-50/30" id="donation">
      <div className="cs-container">
        <SectionHeader
          tag="Donation Drive"
          title={
            <>
              Active <span className="text-mod-donation">Fundraising</span>{" "}
              Campaigns
            </>
          }
          subtitle="Every taka counts. Support verified campaigns started by and for the campus community."
          linkAction="Start a Campaign"
          linkHref="/donation/create"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_DONATIONS.map((campaign, i) => {
            const percent = Math.round((campaign.raised / campaign.goal) * 100);
            return (
              <div
                key={campaign.id}
                className="card overflow-hidden group hover:-translate-y-1 transition-transform"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative h-40 overflow-hidden bg-neutral-100">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-neutral-800">
                      {campaign.category}
                    </span>
                    {campaign.urgent && (
                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> Urgent
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-semibold flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {campaign.daysLeft}d
                    left
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-base text-brand-navy-DEFAULT mb-1">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                    {campaign.desc}
                  </p>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {campaign.donors} donors
                      </span>
                      <span className="text-xs font-bold text-mod-donation">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mod-donation rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-xs text-neutral-500">
                      <span className="font-semibold text-mod-donation">
                        ৳{campaign.raised.toLocaleString()}
                      </span>
                      <span>Goal: ৳{campaign.goal.toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-mod-donation text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                    <Heart className="w-4 h-4" /> Donate Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ─── 14. FULL JOBS BOARD ────────────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: 1,
    title: "Campus Ambassador",
    company: "Daraz Bangladesh",
    type: "Part-time",
    salary: "৳5,000/mo",
    location: "Dhaka (On-site)",
    deadline: "Mar 25, 2026",
    tags: ["Marketing", "Social Media"],
    icon: "📣",
    hot: true,
  },
  {
    id: 2,
    title: "Graphic Designer",
    company: "Student Union — JU",
    type: "Freelance",
    salary: "Per Project",
    location: "Remote",
    deadline: "Mar 30, 2026",
    tags: ["Figma", "Adobe", "Creative"],
    icon: "🎨",
    hot: false,
  },
  {
    id: 3,
    title: "Event Volunteer",
    company: "TechFest 2026",
    type: "Volunteer",
    salary: "Stipend",
    location: "Dhaka",
    deadline: "Apr 01, 2026",
    tags: ["Events", "Coordination"],
    icon: "🎪",
    hot: true,
  },
  {
    id: 4,
    title: "Content Writer",
    company: "CampusSheba Blog",
    type: "Part-time",
    salary: "৳3,000/mo",
    location: "Remote",
    deadline: "Apr 05, 2026",
    tags: ["Writing", "Bangla", "English"],
    icon: "✍️",
    hot: false,
  },
  {
    id: 5,
    title: "Android Developer Intern",
    company: "Sheba Tech Ltd.",
    type: "Internship",
    salary: "৳8,000/mo",
    location: "Gulshan, Dhaka",
    deadline: "Apr 10, 2026",
    tags: ["Android", "Kotlin", "Firebase"],
    icon: "📱",
    hot: true,
  },
  {
    id: 6,
    title: "Food Delivery Rider",
    company: "Campus Food Hub",
    type: "Gig",
    salary: "Per Delivery",
    location: "JU Campus",
    deadline: "Ongoing",
    tags: ["Delivery", "Flexible Hours"],
    icon: "🛵",
    hot: false,
  },
];

const JOB_TYPES = [
  "All",
  "Part-time",
  "Freelance",
  "Internship",
  "Gig",
  "Volunteer",
];
const JOB_TYPE_COLORS: Record<string, string> = {
  "Part-time": "bg-blue-50 text-blue-700 border-blue-200",
  Freelance: "bg-purple-50 text-purple-700 border-purple-200",
  Internship: "bg-green-50 text-green-700 border-green-200",
  Gig: "bg-orange-50 text-orange-700 border-orange-200",
  Volunteer: "bg-pink-50 text-pink-700 border-pink-200",
};

export function JobsSection() {
  const [activeType, setActiveType] = useState("All");
  const filtered =
    activeType === "All"
      ? MOCK_JOBS
      : MOCK_JOBS.filter((j) => j.type === activeType);
  return (
    <Section className="py-16 bg-neutral-50" id="jobs">
      <div className="cs-container">
        <SectionHeader
          tag="Campus Jobs & Gigs"
          title={
            <>
              Find Your Next <span className="text-mod-jobs">Opportunity</span>
            </>
          }
          subtitle="Part-time jobs, internships, freelance gigs, and volunteer roles — all campus-verified."
          linkAction="Browse All Jobs"
          linkHref="/jobs"
        />
        {/* Type Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-hide">
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeType === t ? "bg-mod-jobs text-white border-mod-jobs" : "bg-white text-neutral-600 border-neutral-200 hover:border-mod-jobs/30"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job, i) => (
            <div
              key={job.id}
              className="card p-5 group cursor-pointer hover:-translate-y-0.5 transition-transform flex flex-col sm:flex-row gap-4"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* Logo placeholder */}
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl flex-shrink-0">
                {job.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-base text-brand-navy-DEFAULT">
                        {job.title}
                      </h3>
                      {job.hot && (
                        <span className="text-[10px] text-orange-600 font-bold flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">{job.company}</p>
                  </div>
                  <span
                    className={`badge text-[10px] ${JOB_TYPE_COLORS[job.type] || "bg-neutral-100 text-neutral-600"}`}
                  >
                    {job.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Deadline:{" "}
                    {job.deadline}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-mod-jobs text-white text-xs font-bold hover:bg-sky-700 transition-colors">
                    Apply Now
                  </button>
                  <button className="w-8 h-8 rounded-lg border border-neutral-200 text-neutral-400 flex items-center justify-center hover:border-mod-jobs hover:text-mod-jobs transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Post Job CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-navy-DEFAULT rounded-2xl p-6">
          <div className="text-white text-center sm:text-left">
            <p className="font-bold text-lg mb-1">
              Recruiting? Post a job for free.
            </p>
            <p className="text-sm text-white/50">
              Reach 10,000+ verified campus students immediately.
            </p>
          </div>
          <Link
            href="/jobs/post"
            className="flex-shrink-0 px-6 py-3 rounded-xl bg-mod-jobs text-white text-sm font-bold hover:bg-sky-500 transition-colors flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Post a Job
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── 15. FEATURED MODULE HIGHLIGHTS ──────────────────────────────────────────
const FEATURED_HIGHLIGHTS = [
  {
    module: "Delivery Sheba",
    color: "#6D28D9",
    bg: "#EDE9FE",
    icon: Bike,
    stat: "1,200+ orders/day",
    highlight: "30-minute food delivery to your dorm. Track in real-time.",
    tags: ["Fast", "Tracked", "Campus-wide"],
    href: "/delivery",
  },
  {
    module: "Book Sheba",
    color: "#2563EB",
    bg: "#DBEAFE",
    icon: BookOpen,
    stat: "8,000+ listings",
    highlight: "Save 70% on textbooks. Buy, sell & rent from batchmates.",
    tags: ["Affordable", "Peer-to-peer", "All Depts"],
    href: "/books",
  },
  {
    module: "Campus Marketplace",
    color: "#059669",
    bg: "#D1FAE5",
    icon: ShoppingBag,
    stat: "5,000+ active ads",
    highlight: "Buy & sell anything from electronics to furniture on campus.",
    tags: ["Free Ads", "Trusted", "All Categories"],
    href: "/marketplace",
  },
  {
    module: "Entrepreneurship",
    color: "#E30A13",
    bg: "#FEE2E2",
    icon: Store,
    stat: "1,000+ student shops",
    highlight:
      "Launch your own e-commerce style campus shop and sell products or skills.",
    tags: ["Create Shop", "Sell Skills", "Cart & Orders"],
    href: "/marketplace/shop/create",
  },
  {
    module: "Blood Bank",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: Droplets,
    stat: "500+ donors",
    highlight: "Emergency blood matching in under 15 minutes. Save lives.",
    tags: ["Emergency", "Verified", "All Groups"],
    href: "/blood-bank",
  },
  {
    module: "Tuition Sheba",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: GraduationCap,
    stat: "300+ active posts",
    highlight: "Find tutors or post your tutoring ad to 5,000+ students.",
    tags: ["Tutors", "Students", "Online & Offline"],
    href: "/tuition",
  },
  {
    module: "Campus Jobs",
    color: "#0284C7",
    bg: "#E0F2FE",
    icon: Briefcase,
    stat: "150+ openings",
    highlight: "Part-time jobs, internships & freelance gigs near your campus.",
    tags: ["Part-time", "Internship", "Gigs"],
    href: "/jobs",
  },
  {
    module: "Donation",
    color: "#16A34A",
    bg: "#DCFCE7",
    icon: Heart,
    stat: "৳5L+ raised",
    highlight: "Support verified charity campaigns started by campus students.",
    tags: ["Verified", "Transparent", "Social Impact"],
    href: "/donation",
  },
  {
    module: "Lost & Found",
    color: "#CA8A04",
    bg: "#FEF9C3",
    icon: MapPin,
    stat: "200+ recoveries",
    highlight: "Report & recover lost items via campus-wide network.",
    tags: ["Real-time", "Campus-wide", "Free"],
    href: "/lost-found",
  },
  {
    module: "Parcel Delivery",
    color: "#7C3AED",
    bg: "#EDE9FE",
    icon: Package,
    stat: "500+ parcels sent",
    highlight: "Send packages across campus with real-time tracking.",
    tags: ["Tracking", "Safe", "Affordable"],
    href: "/parcel",
  },
  {
    module: "Eco Pickup",
    color: "#64748B",
    bg: "#F1F5F9",
    icon: Trash2,
    stat: "Eco-friendly",
    highlight: "Campus waste collection service for a cleaner environment.",
    tags: ["Green", "Scheduled", "Campus"],
    href: "/garbage",
  },
];

export function FeaturedModuleHighlights() {
  return (
    <Section className="py-20 bg-white" id="all-features">
      <div className="cs-container">
        <SectionHeader
          tag="All 11 Modules"
          title={
            <>
              Every Service,{" "}
              <span className="text-brand-green-DEFAULT">One Platform</span>
            </>
          }
          subtitle="Campus Sheba brings together 11 powerful modules to cover every aspect of student life."
          center={true}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {FEATURED_HIGHLIGHTS.map((mod, i) => (
            <Link
              key={mod.module}
              href={mod.href}
              className="group card p-5 hover:-translate-y-1.5 transition-all duration-300 border border-neutral-100 hover:border-neutral-200 hover:shadow-lg"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background: mod.bg }}
              >
                <mod.icon
                  className="w-6 h-6"
                  style={{ color: mod.color }}
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-sm text-brand-navy-DEFAULT">
                  {mod.module}
                </h3>
              </div>
              <p
                className="text-xs font-bold mb-2"
                style={{ color: mod.color }}
              >
                {mod.stat}
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-2">
                {mod.highlight}
              </p>
              <div className="flex flex-wrap gap-1">
                {mod.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: mod.bg, color: mod.color }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div
                className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: mod.color }}
              >
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
