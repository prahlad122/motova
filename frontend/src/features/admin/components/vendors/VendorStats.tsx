import { Building2, CircleCheck, FileClock, Store } from "lucide-react";

const cards = [
  { label: "Total vendors", key: "total", icon: Store, tone: "blue" },
  { label: "Active on this page", key: "active", icon: CircleCheck, tone: "green" },
  { label: "Pending on this page", key: "pending", icon: FileClock, tone: "amber" },
  { label: "Profiles on this page", key: "profiles", icon: Building2, tone: "violet" },
] as const;

export default function VendorStats({ values }: { values: Record<(typeof cards)[number]["key"], number> }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600",
  };
  return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ label, key, icon: Icon, tone }) => <article key={key} className="flex items-center gap-3 rounded-xl border border-[#e7eaf0] bg-white p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={19} /></span>
      <div><p className="text-xs text-[#778195]">{label}</p><p className="mt-1 text-xl font-semibold text-[#172033]">{values[key].toLocaleString("en-IN")}</p></div>
    </article>)}
  </section>;
}
