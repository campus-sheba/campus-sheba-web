import type { BloodDonorRow } from "@/types/blood-donor";

function deptLabel(d: BloodDonorRow): string {
  const dep = d.user?.department ?? d.department;
  if (!dep) return "—";
  return typeof dep === "string" ? dep : "—";
}

export default function DonorCard({ donor }: { donor: BloodDonorRow }) {
  const name = donor.user?.name ?? "Donor";
  const available =
    donor.isAvailable !== false && donor.availabilityStatus !== "Not Available";

  return (
    <div className="flex h-full flex-col border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 md:p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-gray-900 md:text-sm">
            {name}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-500 md:text-xs">
            {deptLabel(donor)}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 md:text-xs">
          {donor.bloodGroup}
        </span>
      </div>
      <p
        className={`mt-2 inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          available
            ? "bg-emerald-50 text-emerald-800"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {donor.availabilityStatus ?? (available ? "Available" : "Unavailable")}
      </p>
      {donor.campusLocation ? (
        <p className="mt-2 line-clamp-2 text-[10px] text-gray-600 md:text-xs">
          {donor.campusLocation}
        </p>
      ) : null}
      {donor.phoneNumber ? (
        <a
          href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}
          className="mt-3 text-[11px] font-semibold text-[#00A651] hover:underline md:text-sm"
        >
          {donor.phoneNumber}
        </a>
      ) : null}
    </div>
  );
}
