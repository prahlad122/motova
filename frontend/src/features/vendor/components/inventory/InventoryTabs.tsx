
import {
  STATUS_TABS,
} from "../../inventory/inventory.types";

import type {
  InventoryCounts,
  ProductTab,
} from "../../inventory/inventory.types";

interface InventoryTabsProps {
  activeTab: ProductTab;
  counts: InventoryCounts;
  onTabChange: (tab: ProductTab) => void;
}

export default function InventoryTabs({
  activeTab,
  counts,
  onTabChange,
}: InventoryTabsProps) {
  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
            activeTab === tab.value
              ? "border-[#25282d] bg-[#25282d] text-white"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {tab.label}
          <span className="ml-2 opacity-75">
            {counts[tab.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
