import type { BloodRequestRow } from "@/types/blood-donor";

function urgencyClass(u: string | undefined): string {
  const x = (u ?? "").toLowerCase();
  if (x === "critical" || x === "high") return "bg-red-100 text-red-800";
  if (x === "medium") return "bg-amber-100 text-amber-900";
  return "bg-gray-100 text-gray-700";
}

export default function BloodRequestCard({ row }: { row: BloodRequestRow }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">{row.bloodGroup}</span>
        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${urgencyClass(row.urgencyLevel)}`}>
          {row.urgencyLevel}
        </span>
        {row.status ? (
          <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800">{row.status}</span>
        ) : null}
      </div>
      {row.patientName ? <p className="mt-2 text-sm font-semibold text-gray-900">{row.patientName}</p> : null}
      {row.hospital ? <p className="mt-1 text-sm text-gray-700">{row.hospital}</p> : null}
      {row.location ? <p className="mt-1 text-xs text-gray-600">{row.location}</p> : null}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {row.requiredUnits != null ? <span>Units: {row.requiredUnits}</span> : null}
        {row.requestedBy?.name ? <span>By {row.requestedBy.name}</span> : null}
      </div>
      {row.contactNumber ? (
        <a
          href={`tel:${row.contactNumber.replace(/\s/g, "")}`}
          className="mt-3 inline-block text-sm font-semibold text-[#00A651] hover:underline"
        >
          Contact: {row.contactNumber}
        </a>
      ) : null}
    </div>
  );
}
