import type { Metadata } from "next";
import HomeTemplate from "@/modules/home/templates/HomeTemplate";

export const metadata: Metadata = {
  title: "Campus Sheba — Marketplace, books, map, blood bank & emergency help",
  description:
    "Campus Sheba is a campus lifestyle platform for Bangladesh universities: student marketplace, Book Sheba, blood bank, lost & found, interactive campus map, emergency contacts, and parcel delivery. Food, shops, jobs, and tuition features launching soon.",
  keywords: [
    "Campus Sheba",
    "campus marketplace Bangladesh",
    "university student app",
    "book exchange campus",
    "campus blood donation",
    "lost and found university",
    "campus map",
    "emergency contacts university",
    "campus parcel delivery",
    "student buy sell",
    "Jahangirnagar University app",
    "Dhaka university students",
  ],
  openGraph: {
    title: "Campus Sheba — Your campus. One app.",
    description:
      "Marketplace, books, blood bank, lost & found, campus map, emergency numbers, and parcels — built for students.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeTemplate />;
}
