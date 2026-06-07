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

// ---- Transport Fare Module (live API) ----
// Real fare-guide backend: campus Locations (stops) + a directional Fare
// matrix (price from A→B per vehicle type). Distinct from the mock `VehicleType`
// / `FareRoute` preview types above — these mirror the server schema exactly.
export type FareVehicleType = "pedal_rickshaw" | "auto_rickshaw" | "electric_cart";

/** A named campus stop, addressable by a per-campus unique slug. */
export type TransportLocation = {
  _id: string;
  university: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Populated location shape embedded in matrix / admin-list fare rows. */
export type LocationRef = {
  _id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
};

/** One directional price for one vehicle type. */
export type TransportFare = {
  _id: string;
  university: string;
  vehicleType: FareVehicleType;
  /** Populated (LocationRef) in matrix/admin-list; raw id string in lookup. */
  fromLocation: LocationRef | string;
  toLocation: LocationRef | string;
  fare: number;
  note?: string | null;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

// ---- Transport Fare admin payloads ----
export type CreateLocationPayload = {
  name: string;
  nameBn?: string;
  slug: string;
  isActive?: boolean;
};
export type UpdateLocationPayload = Partial<{
  name: string;
  nameBn: string;
  slug: string;
  isActive: boolean;
}>;
export type CreateFarePayload = {
  vehicleType: FareVehicleType;
  fromLocation: string;
  toLocation: string;
  fare: number;
  note?: string;
  isActive?: boolean;
};
export type BulkFareEntry = {
  fromLocation: string;
  toLocation: string;
  fare: number;
  note?: string;
};
export type UpdateFarePayload = Partial<{
  fare: number;
  note: string;
  isActive: boolean;
}>;

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
