
import type { ReactNode } from "react";
import type { VendorDashboardData } from "../../vendor.types";

export type Segment = {
  label: string;
  value: number;
  color: string;
};

export const C = {
  blue: "#2864f0",
  orange: "#ff9200",
  red: "#e52e25",
  green: "#079669",
  gray: "#cbd5e1",
  ink: "#172033",
  muted: "#687386",
  border: "#dfe4eb",
  canvas: "#f3f5f8",
};

export function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-[10px] border border-[#dce2e9] bg-white p-5 ${className}`}>{children}</section>;
}

export function Donut({ segments, size = 154, thickness = 12, center }: { segments: Segment[]; size?: number; thickness?: number; center?: ReactNode }) {
  const total = segments.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const radius = (100 - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#edf0f4" strokeWidth={thickness} />
        {total > 0 && segments.map((segment) => {
          const dash = (Math.max(0, segment.value) / total) * circumference;
          const currentOffset = offset;
          offset += dash;

          if (segment.value <= 0) return null;

          return <circle key={segment.label} cx="50" cy="50" r={radius} fill="none" stroke={segment.color} strokeWidth={thickness} strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-currentOffset} strokeLinecap="butt" />;
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}

export function Legend({ segments }: { segments: Segment[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {segments.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap text-xs text-[#647084]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
          <span>{item.label}</span>
          <strong className="font-semibold text-[#182235]">{item.value.toLocaleString("en-IN")}</strong>
        </div>
      ))}
    </div>
  );
}

export function DonutCard({ title, segments, footer }: { title: string; segments: Segment[]; footer: string }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex min-h-[320px] flex-col">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#596579]">{title}</h2>
      <div className="flex flex-1 items-center justify-center py-4">
        <Donut size={156} thickness={12} segments={segments} center={<><span className="text-[23px] font-semibold leading-none text-[#1c2638]">{total.toLocaleString("en-IN")}</span><span className="mt-1 text-[10px] text-[#8490a1]">Total</span></>} />
      </div>
      <Legend segments={segments} />
      <p className="mt-4 border-t border-[#e9edf2] pt-3 text-center text-xs text-[#667287]">{footer}</p>
    </Card>
  );
}

export function SalesLineChart({ series }: { series: VendorDashboardData["sales"]["series"] }) {
  if (series.length === 0) {
    return <div className="flex min-h-[220px] items-center justify-center text-sm text-[#8490a1]">No sales data available for this period.</div>;
  }

  const maxRevenue = Math.max(...series.map((item) => item.revenue), 1);
  const points = series.map((item, index) => {
    const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
    const y = 100 - (item.revenue / maxRevenue) * 85;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-md border border-[#e9edf2] bg-[#fbfcfe] p-4">
      <svg viewBox="0 0 100 110" preserveAspectRatio="none" className="h-[220px] w-full overflow-visible">
        <polyline points={points} fill="none" stroke="#2864f0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between gap-2 text-xs text-[#8490a1]">
        <span>{new Date(`${series[0].date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
        <span>{new Date(`${series[series.length - 1].date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const styles = normalized === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : normalized === "SHIPPED" ? "bg-blue-50 text-blue-700" : normalized === "CONFIRMED" || normalized === "PROCESSING" ? "bg-amber-50 text-amber-700" : normalized === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700";
  const label = normalized === "PENDING" ? "New" : normalized === "CONFIRMED" || normalized === "PROCESSING" ? "To ship" : normalized.charAt(0) + normalized.slice(1).toLowerCase();

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{label}</span>;
}

export function TodoRow({ count, label, tone = "red" }: { count: number; label: string; tone?: "red" | "amber" | "gray" }) {
  const badge = tone === "amber" ? "bg-amber-100 text-amber-800" : tone === "gray" ? "bg-slate-200 text-slate-700" : "bg-red-50 text-red-600";

  return (
    <div className="flex w-full items-center gap-3 border-t border-[#e9edf2] py-3 first:border-t-0">
      <span className={`flex h-8 min-w-14 items-center justify-center rounded-full px-3 text-sm font-semibold ${badge}`}>{count}</span>
      <span className="flex-1 text-sm text-[#344054]">{label}</span>
      <span className="text-lg leading-none text-[#8792a2]">›</span>
    </div>
  );
}
