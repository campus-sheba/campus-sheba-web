import {
  Bike,
  BookOpen,
  ShoppingBag,
  Droplets,
  GraduationCap,
  Briefcase,
  Heart,
  Package,
  Trash2,
  MapPin,
  Star,
  Users,
  Building2,
  Zap,
  Shield,
  TrendingUp,
  Search,
  Store,
} from "lucide-react";

export const STATS = [
  { value: "10,000+", label: "Active Students", icon: Users },
  { value: "3", label: "Universities", icon: Building2 },
  { value: "10+", label: "Service Modules", icon: Zap },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
];

export const HERO_ROLES = [
  {
    id: "student",
    label: "Student",
    subtitle: "Discover essentials, opportunities, and community support.",
    primary: { label: "Order Food", href: "/delivery", icon: Bike },
    secondary: { label: "Find Books", href: "/books", icon: BookOpen },
  },
  {
    id: "provider",
    label: "Provider",
    subtitle: "List products, run your shop, and manage campus orders.",
    primary: { label: "Open Shop", href: "/marketplace", icon: ShoppingBag },
    secondary: { label: "Manage Listings", href: "/?auth=login", icon: Package },
  },
  {
    id: "delivery-hero",
    label: "Delivery Hero",
    subtitle: "Accept tasks, track routes, and handle campus fulfillment.",
    primary: { label: "View Deliveries", href: "/delivery", icon: Bike },
    secondary: { label: "Parcel Tasks", href: "/parcel", icon: Package },
  },
  {
    id: "admin",
    label: "Admin",
    subtitle: "Moderate modules, monitor activity, and keep trust high.",
    primary: { label: "Admin Login", href: "/?auth=login", icon: Shield },
    secondary: { label: "View Reports", href: "/?auth=login", icon: TrendingUp },
  },
];

export const HERO_LIVE_SIGNALS = [
  {
    title: "Food Delivery",
    text: "Kacchi Bhai order delivered in 24 min",
    time: "1 min ago",
    icon: Bike,
    color: "#6D28D9",
    bg: "#EDE9FE",
  },
  {
    title: "Book Sheba",
    text: "Calculus book rented by CSE 2nd year",
    time: "3 min ago",
    icon: BookOpen,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    title: "Marketplace",
    text: "Laptop listing got 12 responses",
    time: "5 min ago",
    icon: ShoppingBag,
    color: "#059669",
    bg: "#D1FAE5",
  },
  {
    title: "Blood Bank",
    text: "A+ donor matched near Dhaka Medical",
    time: "6 min ago",
    icon: Droplets,
    color: "#DC2626",
    bg: "#FEE2E2",
  },
  {
    title: "Tuition Sheba",
    text: "Physics tutor post viewed 46 times",
    time: "8 min ago",
    icon: GraduationCap,
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    title: "Jobs",
    text: "Campus ambassador role posted",
    time: "12 min ago",
    icon: Briefcase,
    color: "#0284C7",
    bg: "#E0F2FE",
  },
  {
    title: "Donation",
    text: "Medical campaign reached 78% target",
    time: "15 min ago",
    icon: Heart,
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    title: "Lost & Found",
    text: "Wallet recovered at central library",
    time: "18 min ago",
    icon: MapPin,
    color: "#CA8A04",
    bg: "#FEF9C3",
  },
];

export const MODULES = [
  {
    id: "delivery",
    label: "Delivery Sheba",
    desc: "Food & courier",
    icon: Bike,
    color: "#6D28D9",
    bg: "#EDE9FE",
    href: "/delivery",
  },
  {
    id: "books",
    label: "Book Sheba",
    desc: "Buy, sell & lend",
    icon: BookOpen,
    color: "#2563EB",
    bg: "#DBEAFE",
    href: "/books",
  },
  {
    id: "sell",
    label: "Buy & Sell",
    desc: "Campus marketplace",
    icon: ShoppingBag,
    color: "#059669",
    bg: "#D1FAE5",
    href: "/marketplace",
  },
  {
    id: "entrepreneur",
    label: "Entrepreneurship",
    desc: "Shops & skills",
    icon: Store,
    color: "#E30A13",
    bg: "#FEE2E2",
    href: "/marketplace/shop/create",
  },
  {
    id: "blood",
    label: "Blood Bank",
    desc: "Emergency network",
    icon: Droplets,
    color: "#DC2626",
    bg: "#FEE2E2",
    href: "/blood-bank",
  },
  {
    id: "tuition",
    label: "Tuition Sheba",
    desc: "Find tutors",
    icon: GraduationCap,
    color: "#D97706",
    bg: "#FEF3C7",
    href: "/tuition",
  },
  {
    id: "jobs",
    label: "Jobs",
    desc: "Part-time & gigs",
    icon: Briefcase,
    color: "#0284C7",
    bg: "#E0F2FE",
    href: "/jobs",
  },
  {
    id: "donation",
    label: "Donation",
    desc: "Social causes",
    icon: Heart,
    color: "#16A34A",
    bg: "#DCFCE7",
    href: "/donation",
  },
  {
    id: "parcel",
    label: "Parcel",
    desc: "Send packages",
    icon: Package,
    color: "#7C3AED",
    bg: "#EDE9FE",
    href: "/parcel",
  },
  {
    id: "garbage",
    label: "Eco Pickup",
    desc: "Waste management",
    icon: Trash2,
    color: "#64748B",
    bg: "#F1F5F9",
    href: "/garbage",
  },
  {
    id: "lost",
    label: "Lost & Found",
    desc: "Recover items",
    icon: MapPin,
    color: "#CA8A04",
    bg: "#FEF9C3",
    href: "/lost-found",
  },
];

export const FEATURES = [
  {
    tag: "CAMPUS ESSENTIALS",
    title: "Everything You Need",
    subtitle: "Daily services built for campus life",
    items: [
      {
        icon: Bike,
        color: "#6D28D9",
        bg: "#EDE9FE",
        title: "Delivery Sheba",
        desc: "Order food from campus canteens or nearby restaurants. Real-time tracking included.",
        label: "Most Popular",
      },
      {
        icon: BookOpen,
        color: "#2563EB",
        bg: "#DBEAFE",
        title: "Book Sheba",
        desc: "Buy, sell, lend, or swap textbooks with verified campus students. Save up to 70%.",
        label: "Save Money",
      },
      {
        icon: Droplets,
        color: "#DC2626",
        bg: "#FEE2E2",
        title: "Blood Bank",
        desc: "Emergency blood request system with real-time donor matching. Accessible in <3 taps.",
        label: "Emergency",
      },
      {
        icon: ShoppingBag,
        color: "#059669",
        bg: "#D1FAE5",
        title: "Campus Marketplace",
        desc: "Peer-to-peer buying and selling for students. Gadgets, clothing, furniture and more.",
        label: "Sustainable",
      },
    ],
  },
  {
    tag: "STUDENT EMPOWERMENT",
    title: "Grow Your Opportunities",
    subtitle: "Tools that help you earn, learn, and connect",
    items: [
      {
        icon: GraduationCap,
        color: "#D97706",
        bg: "#FEF3C7",
        title: "Tuition Sheba",
        desc: "Connect with qualified campus tutors or monetize your knowledge by teaching peers.",
        label: "Earn & Learn",
      },
      {
        icon: Briefcase,
        color: "#0284C7",
        bg: "#E0F2FE",
        title: "Campus Jobs",
        desc: "Find part-time jobs, internships, and freelance gigs scoped to your university.",
        label: "Build Career",
      },
      {
        icon: Heart,
        color: "#16A34A",
        bg: "#DCFCE7",
        title: "Donation Drives",
        desc: "Participate in or organize flood relief, Ramadan packs, and medical aid campaigns.",
        label: "Social Impact",
      },
      {
        icon: Package,
        color: "#7C3AED",
        bg: "#EDE9FE",
        title: "Parcel Delivery",
        desc: "Send and receive parcels across campus with real-time tracking. Fast and reliable.",
        label: "Reliable",
      },
    ],
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose Your University",
    desc: "Select from 10+ partner universities. Your data stays scoped to your campus.",
    icon: Building2,
  },
  {
    step: "02",
    title: "Verify Your Identity",
    desc: "Upload your student ID for trusted, verified campus-only access.",
    icon: Shield,
  },
  {
    step: "03",
    title: "Explore Services",
    desc: "Browse all 10 modules from food delivery to blood bank in one app.",
    icon: Search,
  },
  {
    step: "04",
    title: "Transact & Grow",
    desc: "Order, sell, lend, donate, or apply. Everything at your fingertips.",
    icon: TrendingUp,
  },
];

export const TESTIMONIALS = [
  {
    name: "Tanha Akter",
    role: "CSE Student, JU",
    avatar: "TA",
    rating: 5,
    text: "Campus Sheba changed how I survive university life. I get food delivered to my dorm, sold my old textbooks, and even found a part-time job all from one app!",
    module: "Delivery + Books + Jobs",
  },
  {
    name: "Rafi Ahmed",
    role: "Student Entrepreneur, DU",
    avatar: "RA",
    rating: 5,
    text: "I launched my handmade craft business on Campus Sheba and got 50+ orders in the first month. The shop management tools are genuinely enterprise-level.",
    module: "Entrepreneurship",
  },
  {
    name: "Nasrin Sultana",
    role: "Medical Student, CU",
    avatar: "NS",
    rating: 5,
    text: "The blood bank feature is a lifesaver. During an emergency, I found a matching donor within 15 minutes. This platform is doing real social good.",
    module: "Blood Bank",
  },
];

export const UNIVERSITIES = [
  "Jahangirnagar University",
  "Dhaka University",
  "Chittagong University",
  "BUET",
  "KUET",
  "RUET",
];

export const BLOOD_REQUESTS = [
  { group: "A+", location: "Dhaka Medical", urgency: "Critical", time: "5 min ago" },
  { group: "O-", location: "DMCH", urgency: "Urgent", time: "12 min ago" },
  { group: "B+", location: "Jahangirnagar Clinic", urgency: "Normal", time: "23 min ago" },
];

export const FAQS = [
  {
    q: "Who can use Campus Sheba?",
    a: "Any student, teacher, or staff with a valid university ID from a partner campus can register and access all services.",
  },
  {
    q: "Is it free to join?",
    a: "Yes! Registration is completely free. Small service fees may apply on certain transactions (typically 5-10%), always shown upfront.",
  },
  {
    q: "How do I get verified?",
    a: "Upload your university ID card during signup. Our team reviews it within 24 hours and approves your account.",
  },
  {
    q: "Can I sell my old items?",
    a: "Absolutely. Create a listing through Buy & Sell or Book Sheba, set your price, and your campus peers can find and purchase it.",
  },
  {
    q: "How safe are transactions?",
    a: "Only verified campus users can transact. We have a review system, dispute resolution, and admin moderation to keep everything trusted.",
  },
  {
    q: "Is there a mobile app?",
    a: "Yes! Available on Android (Play Store) and iOS (App Store). The web platform is also fully responsive.",
  },
];
