import {
  Bike,
  BookOpen,
  Briefcase,
  Droplets,
  GraduationCap,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";

export type Campus = {
  id: string;
  name: string;
  short: string;
  location: string;
};

export type CampusLocationGroup = {
  title: string;
  items: string[];
};

export type ServiceMenuItem = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bg: string;
};

export type UniversityFeature = {
  _id: string;
  key: string;
  title: string;
  description: string;
  icon?: {
    url?: string;
    key?: string;
    size?: number;
  };
  routeName: string;
  sortOrder: number;
  isActive: boolean;
};

export const CAMPUSES: Campus[] = [
  { id: "ju", name: "Jahangirnagar University", short: "JU", location: "Savar, Dhaka" },
  { id: "du", name: "Dhaka University", short: "DU", location: "Nilkhet, Dhaka" },
  { id: "cu", name: "Chittagong University", short: "CU", location: "Hathazari, Chittagong" },
  { id: "buet", name: "BUET", short: "BUET", location: "Palashi, Dhaka" },
  { id: "kuet", name: "KUET", short: "KUET", location: "Khulna" },
  { id: "ruet", name: "RUET", short: "RUET", location: "Rajshahi" },
];

export const DEFAULT_CAMPUS_LOCATION_GROUPS: CampusLocationGroup[] = [
  {
    title: "Residential Zones",
    items: ["Main Hall Area", "Dormitory Road", "Residence Block", "Guest House Area"],
  },
  {
    title: "Academic Spots",
    items: ["Central Library", "Academic Building", "Department Zone", "Admin Building"],
  },
  {
    title: "Student Hubs",
    items: ["Main Gate", "Cafeteria", "TSC", "Central Field"],
  },
];

export const CAMPUS_LOCATION_GROUPS: Record<string, CampusLocationGroup[]> = {
  ju: [
    {
      title: "Male Halls",
      items: [
        "Al Beruni Hall",
        "Mir Mosharraf Hossain Hall",
        "A.F.M. Kamaluddin Hall",
        "Maulana Bhashani Hall",
        "Shaheed Salam-Barkat Hall",
        "Shaheed Rafiq-Jabbar Hall",
        "Bishwakabi Rabindranath Tagore Hall",
        "Sher-e-Bangla AK Fazlul Huq Hall",
        "Nawab Salimullah Hall",
        "Shaheed Tajuddin Ahmad Hall",
        "Jatiya Kabi Kazi Nazrul Islam Hall",
      ],
    },
    {
      title: "Female Halls",
      items: [
        "Nawab Faizunnesa Hall",
        "Fazilatunnesa Hall",
        "Jahanara Imam Hall",
        "Pritilata Hall",
        "Begum Khaleda Zia Hall",
        "Begum Sufia Kamal Hall",
        "Rokeya Hall",
        "Bir Protik Taramon Bibi Hall",
        "July 24 Jagarani Hall",
        "Shaheed Felani Khatun Hall",
        "Female Student Hall No. 13",
      ],
    },
    {
      title: "Natural Landmarks",
      items: ["Lakes & Migratory Birds", "Monpura", "London Bridge", "VC Pukur", "Switzerland"],
    },
    {
      title: "Monuments & Sculptures",
      items: ["Central Shaheed Minar", "Sangshaptak", "Amar Ekushey", "Selim Al Deen Muktomoncho"],
    },
    {
      title: "Student Hubs & Food Spots",
      items: ["Bot Tola", "Tarzan Point", "Chowrongi", "Central Field"],
    },
    {
      title: "Other Notable Sites",
      items: ["Central Mosque", "Butterfly Park and Research Centre", "Zahir Raihan Auditorium"],
    },
  ],
};

export const servicesMenu: ServiceMenuItem[] = [
  { label: "Delivery Sheba", description: "Food & courier delivery", href: "/delivery", icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Buy & Sell", description: "Campus marketplace", href: "/marketplace", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Entrepreneurship", description: "Student shops & skill services", href: "/marketplace/shop/create", icon: Store, color: "text-red-600", bg: "bg-red-50" },
  { label: "Book Sheba", description: "Buy, sell, loan & swap", href: "/books", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Blood Bank", description: "Emergency blood network", href: "/blood-bank", icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
  { label: "Tuition Sheba", description: "Find or become a tutor", href: "/tuition", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Jobs", description: "Campus opportunities", href: "/jobs", icon: Briefcase, color: "text-sky-600", bg: "bg-sky-50" },
  { label: "Donation", description: "Social causes & drives", href: "/donation", icon: Heart, color: "text-green-600", bg: "bg-green-50" },
  { label: "Parcel Delivery", description: "Send packages on campus", href: "/parcel", icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Garbage Collector", description: "Eco-friendly waste pickup", href: "/garbage", icon: Trash2, color: "text-slate-600", bg: "bg-slate-50" },
  { label: "Lost & Found", description: "Recover lost items", href: "/lost-found", icon: MapPin, color: "text-yellow-600", bg: "bg-yellow-50" },
];

const FEATURE_VISUALS: Record<
  string,
  Pick<ServiceMenuItem, "icon" | "color" | "bg">
> = {
  food: { icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
  buy_sell: { icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  campus_mart: { icon: Store, color: "text-red-600", bg: "bg-red-50" },
  book: { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
  blood: { icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
  tuition: { icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
  jobs: { icon: Briefcase, color: "text-sky-600", bg: "bg-sky-50" },
  donation: { icon: Heart, color: "text-green-600", bg: "bg-green-50" },
  parcel: { icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  garbage: { icon: Trash2, color: "text-slate-600", bg: "bg-slate-50" },
  lost_found: { icon: MapPin, color: "text-yellow-600", bg: "bg-yellow-50" },
};

export const mapUniversityFeaturesToServicesMenu = (
  features: UniversityFeature[],
): ServiceMenuItem[] => {
  return features
    .filter((feature) => feature.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((feature) => {
      const visuals = FEATURE_VISUALS[feature.key] ?? {
        icon: Store,
        color: "text-brand-green-DEFAULT",
        bg: "bg-brand-green-50",
      };

      return {
        label: feature.title,
        description: feature.description,
        href: feature.routeName,
        icon: visuals.icon,
        color: visuals.color,
        bg: visuals.bg,
      };
    });
};

export const navLinks = [
//   { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "about" },
];
