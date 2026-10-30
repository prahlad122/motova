
import type { AdminDashboardStats } from "../../admin.types";

const COLORS = {
  blue: "#2864f0",
  border: "#e4e8ef",
  muted: "#778195",
  text: "#172033",
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#dce2eb] px-4 text-center text-xs text-[#778195]">
      {children}
    </div>
  );
}

export default function SalesChart({
  series,
}: {
  series: AdminDashboardStats["sales"]["series"];
}) {
  const values = series.map((item) => item.revenue);
  const max = Math.max(...values, 1);

  const points = values
    .map((value, index) => {
      const x =
        values.length <= 1 ? 300 : (index / (values.length - 1)) * 600;
      const y = 155 - (value / max) * 130;
      return `${x},${y}`;
    })
    .join(" ");

  const area = values.length ? `0,160 ${points} 600,160` : "";

  const labelAt = (index: number) => {
    const item = series[index];

    if (!item) return "";

    return new Date(`${item.date}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (!series.length) {
    return <EmptyState>No sales trend data is available yet.</EmptyState>;
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-[#172033]">
          {currency(values.reduce((sum, value) => sum + value, 0))}
        </p>

        <span className="text-[11px] text-[#778195]">
          Revenue over {series.length} days
        </span>
      </div>

      <div className="flex h-48 gap-3">
        <div className="flex flex-col justify-between pb-1 text-[10px] text-[#778195]">
          <span>{currency(max)}</span>
          <span>{currency(max * 0.66)}</span>
          <span>{currency(max * 0.33)}</span>
          <span>₹0</span>
        </div>

        <div className="min-w-0 flex-1">
          <svg
            viewBox="0 0 600 170"
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label="Revenue by date"
          >
            {[25, 68, 112, 155].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="600"
                y2={y}
                stroke={COLORS.border}
                strokeWidth="1"
              />
            ))}

            {values.some((value) => value > 0) && (
              <>
                <polygon points={area} fill={COLORS.blue} opacity="0.1" />
                <polyline
                  points={points}
                  fill="none"
                  stroke={COLORS.blue}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>

          <div className="flex justify-between pt-2 text-[10px] text-[#778195]">
            <span>{labelAt(0)}</span>
            <span>{labelAt(Math.floor((series.length - 1) / 2))}</span>
            <span>{labelAt(series.length - 1)}</span>
          </div>
        </div>
      </div>

      {!values.some((value) => value > 0) && (
        <p className="mt-2 text-center text-xs text-[#778195]">
          No delivered-order revenue recorded for this period.
        </p>
      )}
    </div>
  );
}
