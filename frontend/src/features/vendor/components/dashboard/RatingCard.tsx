
import { C, Card, Donut } from "./DashboardUI";
import type { VendorDashboardData } from "../../vendor.types";

interface RatingCardProps {
  rating: VendorDashboardData["analytics"]["rating"];
  rangeDays: number;
}

export default function RatingCard({ rating, rangeDays }: RatingCardProps) {
  const average = Math.min(5, Math.max(0, rating.average));
  const roundedRating = Math.round(average);

  return (
    <Card className="mt-5">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#596579]">Rating</h2>
      <div className="mt-4 grid items-center gap-6 md:grid-cols-[1fr_1.2fr_1fr]">
        <div className="flex justify-center">
          <Donut size={142} thickness={11} segments={[{ label: "Rating", value: average, color: C.blue }, { label: "Remaining", value: 5 - average, color: C.gray }]} center={<><strong className="text-2xl">{average.toFixed(1)}</strong><span className="text-[10px] text-[#7b8798]">out of 5</span></>} />
        </div>

        <div className="space-y-3 border-y border-[#edf0f4] py-4 md:border-y-0 md:border-x md:px-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#647084]">Average rating</span>
            <strong>{average.toFixed(1)} / 5</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#edf0f4]">
            <div className="h-full rounded-full bg-[#2864f0]" style={{ width: `${(average / 5) * 100}%` }} />
          </div>
          <p className="text-xs text-[#8490a1]">Rating summary for your products in the selected period.</p>
        </div>

        <div className="text-center md:text-left">
          <p className="text-4xl font-semibold tracking-tight">{average.toFixed(1)} <span className="text-xl">/ 5</span></p>
          <div className="mt-1 text-2xl tracking-wide text-[#ff9200]">{"★".repeat(roundedRating)}<span className="text-[#d9dee7]">{"★".repeat(5 - roundedRating)}</span></div>
          <p className="mt-1 text-sm text-[#647084]">{rating.reviewCount.toLocaleString("en-IN")} reviews in the last {rangeDays} days</p>
        </div>
      </div>
    </Card>
  );
}
