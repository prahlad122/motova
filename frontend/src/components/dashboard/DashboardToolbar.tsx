"use client";

import Icon from "@/components/ui/Icon";

export default function DashboardToolbar() {
  return (
    <div className="flex h-[47px] shrink-0 items-center justify-between gap-2 border-b border-[#eceef0] px-3 sm:px-4 lg:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        {/* Filter */}
        <button
          type="button"
          className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7ea] bg-white px-3 text-[10px] font-medium text-[#3c4045] sm:text-[11px]"
        >
          <span>Filter tasks</span>

          <Icon name="filter_list" className="text-[14px] text-[#8a9097]" />
        </button>

        {/* Sort */}
        <button
          type="button"
          className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-[#e5e7ea] bg-white px-3 text-[10px] font-medium text-[#3c4045] sm:text-[11px]"
        >
          <span>Sort tasks</span>

          <Icon
            name="keyboard_arrow_down"
            className="text-[14px] text-[#8a9097]"
          />
        </button>

        {/* Search */}
        <div className="hidden h-[30px] w-[180px] items-center rounded-full border border-[#e5e7ea] px-3 md:flex">
          <input
            type="text"
            placeholder="Try 'Miami beachhouse'"
            className="min-w-0 flex-1 bg-transparent text-[10px] text-[#33373d] outline-none placeholder:text-[8px] placeholder:text-[#b6bbc1]"
          />

          <Icon
            name="search"
            className="shrink-0 text-[14px] text-[#656b73]"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Customise */}
        <button
          type="button"
          className="hidden h-[30px] items-center gap-2 rounded-full border border-[#e5e7ea] bg-white px-3 text-[10px] font-medium text-[#3c4045] sm:flex"
        >
          <span>Customise</span>

          <Icon name="tune" className="text-[14px] text-[#8a9097]" />
        </button>

        {/* More */}
        <button
          type="button"
          aria-label="More options"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#e5e7ea] bg-white text-[#3f444a]"
        >
          <Icon name="more_vert" className="text-[17px]" />
        </button>
      </div>
    </div>
  );
}