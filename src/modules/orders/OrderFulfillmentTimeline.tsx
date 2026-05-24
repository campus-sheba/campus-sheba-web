import { Check } from "lucide-react";

export function OrderFulfillmentTimeline({
  steps,
  reached,
}: {
  steps: readonly string[];
  reached: number;
}) {
  if (reached < 0) {
    return (
      <p className="text-sm text-red-600">This order was cancelled.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-start">
      {steps.map((label, i) => {
        const done = i <= reached;
        const isLast = i === steps.length - 1;
        return (
          <li key={label} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center">
            <div className="flex flex-col items-center gap-1 sm:w-full">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                  done
                    ? "border-[#E30B12] bg-[#E30B12] text-white"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`text-center text-[10px] font-medium leading-tight sm:text-xs ${
                  done ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast ? (
              <span
                className={`mt-3 hidden h-0.5 flex-1 sm:mt-4 sm:block ${
                  i < reached ? "bg-[#E30B12]" : "bg-gray-200"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
