
interface DashboardHeaderProps {
  onRefresh: () => void;
}

export default function DashboardHeader({
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#172033] sm:text-2xl">
          Dashboard overview
        </h1>
        <p className="mt-1 text-xs text-[#778195]">
          Marketplace performance · Last 30 days
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-[#dce2eb] bg-white px-3.5 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
      >
        Refresh data ↻
      </button>
    </header>
  );
}
