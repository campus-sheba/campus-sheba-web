// Transport & Mobility (CSFS-002) — shared types for the unified hub.
// Live Bus + platform Parcel use real APIs; Fare Guide / Rent / Ride / Ticket
// are interactive frontend previews driven by mock data.

export type VehicleType = "Campus Bus" | "Rickshaw" | "CNG" | "Auto" | "E-Cart";

export type BusStatus = "Active" | "Inactive" | "Breakdown" | "Cancelled";

export type TransportRoute = {
  id: string;
  name: string;
  /** Brand-consistent color used across map line, chips and pins. */
  color: string;
  vehicleType: VehicleType;
  status: BusStatus;
  headwayMins: number; // frequency during peak
  stops: RouteStop[];
  note?: string;
};

export type RouteStop = {
  id: string;
  name: string;
  /** Schedule-based ETA in minutes from "now" (mock). */
  etaMins: number;
};

// ---- Fare Guide ----
export type FarePlace = { id: string; name: string };
export type FareCell = {
  vehicleType: VehicleType;
  min: number;
  max: number;
  shared?: boolean;
  note?: string;
};
export type FareRoute = {
  fromId: string;
  toId: string;
  distanceKm: number;
  fares: FareCell[];
};

// ---- Vehicle Rent ----
export type RentUnit = "hour" | "day" | "block";
export type RentVehicle = {
  id: string;
  name: string;
  category: "Cycle" | "E-Cart" | "Bike" | "Scooter";
  gradient: string; // tailwind gradient classes for the photo tile
  emoji: string;
  pricePerUnit: number;
  unit: RentUnit;
  unitLabel: string; // "day" / "6-hour block"
  deposit: number;
  available: boolean;
  rating: number;
  trips: number;
  location: string;
  perks: string[];
};

// ---- Ride Sharing ----
export type RideOffer = {
  id: string;
  host: { name: string; initials: string; rating: number; trustScore: number };
  fromName: string;
  toName: string;
  departAt: string; // ISO
  seatsTotal: number;
  seatsLeft: number;
  vehicle: string;
  perSeatFare: number; // 0 = free
  recurring?: boolean;
  note?: string;
};

// ---- Intercity Ticket ----
export type SeatState = "available" | "booked" | "selected" | "ladies";
export type IntercityTrip = {
  id: string;
  operator: string;
  fromName: string;
  toName: string;
  departAt: string; // ISO
  arriveAt: string; // ISO
  durationLabel: string;
  coachType: "AC" | "Non-AC" | "AC Sleeper";
  fare: number;
  seatsLeft: number;
  boardingPoint: string;
  rating: number;
};
