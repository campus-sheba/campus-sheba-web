import type { BloodRequestRow } from "@/types/blood-donor";

function urgencyClass(u: string | undefined): string {
  const x = (u ?? "").toLowerCase();
  if (x === "critical" || x === "high") return "bg-red-100 text-red-800";
  if (x === "medium") return "bg-amber-100 text-amber-900";
  return "bg-gray-100 text-gray-700";
}

export default function BloodRequestCard({ row }: { row: BloodRequestRow }) {
  return (
    <div className="flex h-full flex-col border border-gray-100 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 md:text-xs">
          {row.bloodGroup}
        </span>
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-semibold md:text-[11px] ${urgencyClass(row.urgencyLevel)}`}
        >
          {row.urgencyLevel}
        </span>
        {row.status ? (
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 md:text-[11px]">
            {row.status}
          </span>
        ) : null}
      </div>
      {row.patientName ? (
        <p className="mt-2 text-[11px] font-semibold text-gray-900 md:text-sm">
          {row.patientName}
        </p>
      ) : null}
      {row.hospital ? (
        <p className="mt-1 text-[11px] text-gray-700 md:text-sm">
          {row.hospital}
        </p>
      ) : null}
      {row.location ? (
        <p className="mt-1 text-[10px] text-gray-600 md:text-xs">
          {row.location}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500 md:text-xs">
        {row.requiredUnits != null ? (
          <span>Units: {row.requiredUnits}</span>
        ) : null}
        {row.requestedBy?.name ? <span>By {row.requestedBy.name}</span> : null}
      </div>
      {row.contactNumber ? (
        <a
          href={`tel:${row.contactNumber.replace(/\s/g, "")}`}
          className="mt-3 inline-block text-[11px] font-semibold text-[#00A651] hover:underline md:text-sm"
        >
          Contact: {row.contactNumber}
        </a>
      ) : null}
    </div>
  );
}
