// Tenant-flavored mock data (Jahangirnagar University examples from CSFS-002).
// Drives the interactive "Preview" sub-modules until their backends exist.

import type {
  FarePlace,
  FareRoute,
  IntercityTrip,
  RentVehicle,
  RideOffer,
  TransportRoute,
} from "@/types/transport";

export const ROUTE_COLORS = {
  green: "#00A651",
  blue: "#2563eb",
  violet: "#7c3aed",
  amber: "#d97706",
  rose: "#e11d48",
} as const;

export const MOCK_ROUTES: TransportRoute[] = [
  {
    id: "r-bishmail",
    name: "Bishmail Express",
    color: ROUTE_COLORS.green,
    vehicleType: "Campus Bus",
    status: "Active",
    headwayMins: 15,
    note: "Residential halls → Academic Building loop · every 15 min at peak",
    stops: [
      { id: "s1", name: "Bishmail Gate", etaMins: 2 },
      { id: "s2", name: "Bottola", etaMins: 5 },
      { id: "s3", name: "TSC", etaMins: 9 },
      { id: "s4", name: "Pritilata Hall", etaMins: 13 },
      { id: "s5", name: "Academic Building", etaMins: 18 },
    ],
  },
  {
    id: "r-dhaka",
    name: "Dhaka City Service",
    color: ROUTE_COLORS.blue,
    vehicleType: "Campus Bus",
    status: "Active",
    headwayMins: 60,
    note: "JU → Farmgate · Gulshan · Mohakhali · 8 AM out / 6 PM return",
    stops: [
      { id: "d1", name: "Dairy Gate", etaMins: 4 },
      { id: "d2", name: "Savar Bus Stand", etaMins: 22 },
      { id: "d3", name: "Farmgate", etaMins: 58 },
      { id: "d4", name: "Mohakhali", etaMins: 71 },
    ],
  },
  {
    id: "r-savar",
    name: "Savar Local",
    color: ROUTE_COLORS.violet,
    vehicleType: "Campus Bus",
    status: "Breakdown",
    headwayMins: 60,
    note: "JU → Savar Bazar · hourly · primary off-campus commuter link",
    stops: [
      { id: "v1", name: "Dairy Gate", etaMins: 0 },
      { id: "v2", name: "Gerua", etaMins: 8 },
      { id: "v3", name: "Savar Bazar", etaMins: 19 },
    ],
  },
  {
    id: "r-nabinagar",
    name: "Nabinagar Route",
    color: ROUTE_COLORS.amber,
    vehicleType: "Campus Bus",
    status: "Inactive",
    headwayMins: 0,
    note: "JU → Nabinagar Bypass · on-demand based on student bookings",
    stops: [
      { id: "n1", name: "Bishmail Gate", etaMins: 0 },
      { id: "n2", name: "Nabinagar Bypass", etaMins: 24 },
    ],
  },
];

// ---- Fare Guide ----
export const FARE_PLACES: FarePlace[] = [
  { id: "p-dairy", name: "Dairy Gate" },
  { id: "p-tsc", name: "TSC" },
  { id: "p-bottle", name: "Bottle Tree Garden" },
  { id: "p-lake", name: "Shankhachil Lake" },
  { id: "p-savar", name: "Savar Bazar" },
  { id: "p-highway", name: "Dhaka-Aricha Highway" },
];

export const MOCK_FARES: FareRoute[] = [
  {
    fromId: "p-dairy",
    toId: "p-tsc",
    distanceKm: 1.1,
    fares: [
      { vehicleType: "Rickshaw", min: 20, max: 30 },
      { vehicleType: "E-Cart", min: 10, max: 10, note: "flat fare" },
      { vehicleType: "Auto", min: 15, max: 25, shared: true },
    ],
  },
  {
    fromId: "p-dairy",
    toId: "p-bottle",
    distanceKm: 1.6,
    fares: [
      { vehicleType: "Rickshaw", min: 30, max: 40 },
      { vehicleType: "E-Cart", min: 10, max: 10, note: "flat fare" },
    ],
  },
  {
    fromId: "p-dairy",
    toId: "p-lake",
    distanceKm: 2.4,
    fares: [
      { vehicleType: "Rickshaw", min: 50, max: 60 },
      { vehicleType: "Auto", min: 30, max: 40, shared: true },
    ],
  },
  {
    fromId: "p-dairy",
    toId: "p-highway",
    distanceKm: 3.2,
    fares: [
      { vehicleType: "Auto", min: 25, max: 35, shared: true },
      { vehicleType: "CNG", min: 60, max: 90, shared: true, note: "metered / shared" },
    ],
  },
  {
    fromId: "p-dairy",
    toId: "p-savar",
    distanceKm: 5.5,
    fares: [
      { vehicleType: "CNG", min: 100, max: 140, shared: true },
      { vehicleType: "Auto", min: 40, max: 60, shared: true },
    ],
  },
];

// ---- Vehicle Rent ----
export const MOCK_RENTALS: RentVehicle[] = [
  {
    id: "rent-cycle",
    name: "Daily Cycle Rental",
    category: "Cycle",
    gradient: "from-emerald-400 to-teal-500",
    emoji: "🚲",
    pricePerUnit: 50,
    unit: "day",
    unitLabel: "day",
    deposit: 200,
    available: true,
    rating: 4.7,
    trips: 312,
    location: "JU Cycle Bank · Dairy Gate",
    perks: ["Helmet included", "Refundable deposit", "Basket"],
  },
  {
    id: "rent-ecart",
    name: "E-Cart 6-Hour Block",
    category: "E-Cart",
    gradient: "from-amber-400 to-orange-500",
    emoji: "🛺",
    pricePerUnit: 200,
    unit: "block",
    unitLabel: "6-hour block",
    deposit: 500,
    available: true,
    rating: 4.5,
    trips: 88,
    location: "Internal Campus Loop",
    perks: ["Seats 4", "Great for moving hostel items", "Driver optional"],
  },
  {
    id: "rent-scooter",
    name: "Electric Scooter",
    category: "Scooter",
    gradient: "from-sky-400 to-blue-600",
    emoji: "🛵",
    pricePerUnit: 80,
    unit: "hour",
    unitLabel: "hour",
    deposit: 1000,
    available: false,
    rating: 4.8,
    trips: 145,
    location: "TSC Mobility Point",
    perks: ["Up to 25 km/h", "Helmet included", "App unlock"],
  },
  {
    id: "rent-bike",
    name: "Commuter Bicycle (Geared)",
    category: "Cycle",
    gradient: "from-violet-400 to-purple-600",
    emoji: "🚴",
    pricePerUnit: 90,
    unit: "day",
    unitLabel: "day",
    deposit: 300,
    available: true,
    rating: 4.6,
    trips: 57,
    location: "Pritilata Hall Stand",
    perks: ["21-speed", "Lock + light", "Repair cover"],
  },
];

// ---- Ride Sharing ----
const inMinutes = (m: number) => new Date(Date.now() + m * 60000).toISOString();
export const MOCK_RIDES: RideOffer[] = [
  {
    id: "ride-1",
    host: { name: "Sadia Rahman", initials: "SR", rating: 4.9, trustScore: 96 },
    fromName: "Bishmail Gate",
    toName: "Farmgate, Dhaka",
    departAt: inMinutes(45),
    seatsTotal: 3,
    seatsLeft: 2,
    vehicle: "Private car (AC)",
    perSeatFare: 120,
    recurring: true,
    note: "Leaving sharp. Drop near Farmgate overbridge.",
  },
  {
    id: "ride-2",
    host: { name: "Tanvir Hasan", initials: "TH", rating: 4.7, trustScore: 88 },
    fromName: "Dairy Gate",
    toName: "Savar Bazar",
    departAt: inMinutes(20),
    seatsTotal: 2,
    seatsLeft: 1,
    vehicle: "CNG (shared)",
    perSeatFare: 40,
  },
  {
    id: "ride-3",
    host: { name: "Mitu Akter", initials: "MA", rating: 5.0, trustScore: 99 },
    fromName: "Pritilata Hall",
    toName: "Academic Building",
    departAt: inMinutes(8),
    seatsTotal: 3,
    seatsLeft: 3,
    vehicle: "Walk + e-cart",
    perSeatFare: 0,
    note: "Free — just want company for the morning class.",
  },
];

// ---- Intercity Ticket ----
const at = (hours: number, mins = 0) => {
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};
export const MOCK_TRIPS: IntercityTrip[] = [
  {
    id: "trip-sylhet",
    operator: "Hanif Enterprise",
    fromName: "JU (Dairy Gate)",
    toName: "Sylhet",
    departAt: at(20, 0),
    arriveAt: at(4, 30),
    durationLabel: "8h 30m",
    coachType: "AC",
    fare: 1200,
    seatsLeft: 11,
    boardingPoint: "Dairy Gate",
    rating: 4.5,
  },
  {
    id: "trip-ctg",
    operator: "Green Line Paribahan",
    fromName: "JU",
    toName: "Chattogram",
    departAt: at(21, 0),
    arriveAt: at(5, 0),
    durationLabel: "8h 00m",
    coachType: "AC Sleeper",
    fare: 1500,
    seatsLeft: 6,
    boardingPoint: "Dairy Gate",
    rating: 4.7,
  },
  {
    id: "trip-cox",
    operator: "Shyamoli Paribahan",
    fromName: "JU",
    toName: "Cox's Bazar",
    departAt: at(19, 30),
    arriveAt: at(7, 0),
    durationLabel: "11h 30m",
    coachType: "Non-AC",
    fare: 900,
    seatsLeft: 23,
    boardingPoint: "Bishmail Gate",
    rating: 4.2,
  },
];

export const INTERCITY_DESTINATIONS = ["Sylhet", "Chattogram", "Cox's Bazar"];
