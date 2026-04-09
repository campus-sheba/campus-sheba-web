import {
  GraduationCap,
  Bike,
  BookOpen,
  ShoppingBag,
  Droplets,
  Briefcase,
  Heart,
  Package,
  Trash2,
  MapPin,
  FacebookIcon,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

export const SERVICES = [
  { label: "Delivery Sheba", href: "/delivery", icon: Bike },
  { label: "Book Sheba", href: "/books", icon: BookOpen },
  { label: "Buy & Sell", href: "/marketplace", icon: ShoppingBag },
  { label: "Blood Bank", href: "/blood-bank", icon: Droplets },
  { label: "Tuition Sheba", href: "/tuition", icon: GraduationCap },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Donation", href: "/donation", icon: Heart },
  { label: "Parcel Delivery", href: "/parcel", icon: Package },
  { label: "Eco Pickup", href: "/garbage", icon: Trash2 },
  { label: "Lost & Found", href: "/lost-found", icon: MapPin },
];

export const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Press Kit", href: "/press" },
  { label: "Contact", href: "/contact" },
];

export const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help" },
  { label: "Community Guidelines", href: "/guidelines" },
  { label: "Report an Issue", href: "/report" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-condition" },
];

export const FALLBACK_UNIVERSITIES = [
  "Jahangirnagar University",
  "Dhaka University",
  "Chittagong University",
  "+ More Coming Soon",
];

export const SOCIAL = [
  {
    label: "Facebook",
    icon: FacebookIcon,
    href: "https://facebook.com/campussheba",
  },
  {
    label: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/campussheba",
  },
  { label: "Twitter", icon: Twitter, href: "https://twitter.com/campussheba" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com/campussheba" },
];
