import Link from "next/link";
import {
  Users,
  Globe,
  GraduationCap,
  Zap,
  ShieldCheck,
  Heart,
} from "lucide-react";

const TEAM = [
  {
    name: "Md. Rafiqul Islam",
    role: "CEO & Co-Founder",
    dept: "CSE, Dhaka University",
    image: "👨‍💼",
  },
  {
    name: "Farida Khatun",
    role: "CTO & Co-Founder",
    dept: "EEE, BUET",
    image: "👩‍💻",
  },
  {
    name: "Tanvir Ahmed",
    role: "Head of Product",
    dept: "BBA, NSU",
    image: "👨‍🎨",
  },
  {
    name: "Sumaiya Akter",
    role: "Head of Marketing",
    dept: "MBA, DU",
    image: "👩‍💼",
  },
  {
    name: "Rezaul Karim",
    role: "Lead Engineer",
    dept: "CSE, CUET",
    image: "👨‍💻",
  },
  {
    name: "Nusrat Jahan",
    role: "Community Manager",
    dept: "Sociology, JU",
    image: "👩‍🏫",
  },
];

const SERVICES = [
  {
    icon: "🍔",
    label: "Food Delivery",
    desc: "Order from campus restaurants",
    href: "/delivery",
  },
  {
    icon: "🛍️",
    label: "Marketplace",
    desc: "Buy & sell on campus",
    href: "/marketplace",
  },
  {
    icon: "📚",
    label: "Books",
    desc: "Exchange academic books",
    href: "/books",
  },
  {
    icon: "🩸",
    label: "Blood Bank",
    desc: "Find blood donors",
    href: "/blood-bank",
  },
  {
    icon: "🎓",
    label: "Tuition",
    desc: "Find & become a tutor",
    href: "/tuition",
  },
  { icon: "💼", label: "Jobs", desc: "Part-time campus jobs", href: "/jobs" },
  {
    icon: "💚",
    label: "Donations",
    desc: "Support student campaigns",
    href: "/donation",
  },
  {
    icon: "📦",
    label: "Parcel",
    desc: "Send parcels on campus",
    href: "/parcel",
  },
  {
    icon: "🗑️",
    label: "Garbage",
    desc: "Schedule waste pickup",
    href: "/garbage",
  },
  {
    icon: "🔍",
    label: "Lost & Found",
    desc: "Recover lost belongings",
    href: "/lost-found",
  },
];

const STATS = [
  { value: "50,000+", label: "Active Students" },
  { value: "120+", label: "Campuses" },
  { value: "10", label: "Services" },
  { value: "98%", label: "Satisfaction Rate" },
];

const VALUES = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community First",
    desc: "Every decision is made with students at the center. We build for and with the campus community.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Nationwide Reach",
    desc: "From Dhaka to Chittagong, we're connecting students across every major university in Bangladesh.",
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Student-Led",
    desc: "Campus Sheba was founded by students and continues to be shaped by student feedback and innovation.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Speed & Reliability",
    desc: "Fast, reliable services that students can count on for their everyday campus needs.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Safe & Verified",
    desc: "All users and service providers are campus-verified, ensuring a trusted and safe environment.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Social Impact",
    desc: "We support blood donation drives, charitable campaigns, and community initiatives that matter.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <p>About Page</p>
    </div>
  );
}
