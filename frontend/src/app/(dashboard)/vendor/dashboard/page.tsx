"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Bell,
  Bookmark,
  ChevronDown,
  CircleHelp,
  Clock3,
  Grid2X2,
  ListFilter,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Tags,
  Users,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Grid2X2,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: Users,
  },
  {
    label: "Category",
    href: "/dashboard/category",
    icon: Tags,
  },
  {
    label: "Last Updated",
    href: "/dashboard/last-updated",
    icon: Clock3,
  },
  {
    label: "Social Media",
    href: "/dashboard/social-media",
    icon: Share2,
  },
  {
    label: "Product Manual",
    href: "/dashboard/product-manual",
    icon: Grid2X2,
  },
  {
    label: "Documentation",
    href: "/dashboard/documentation",
    icon: Bookmark,
  },
];

export default function DashboardPage() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      <div className="flex min-h-screen w-full">

        {/* =========================================================
            MOBILE OVERLAY
        ========================================================= */}
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
        )}

        {/* =========================================================
            SIDEBAR
        ========================================================= */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            flex w-[250px] flex-col
            bg-[#17191d] text-white
            transition-transform duration-300 ease-in-out

            ${
              mobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }

            md:static
            md:w-[168px]
            md:shrink-0
            md:translate-x-0
          `}
        >
          {/* Logo */}
          <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#24272c] px-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/images/logo.svg"
                alt="Motova"
                width={140}
                height={30}
                priority
                className="h-auto w-[137px]"
              />
            </Link>

            {/* Mobile close */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#c9ccd0] hover:bg-[#24272c] md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto pt-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group relative flex h-[42px]
                    items-center gap-3
                    px-4 text-[12px] font-medium
                    transition-colors

                    ${
                      isActive
                        ? "bg-[#22252a] text-white"
                        : "text-[#d1d3d6] hover:bg-[#202328] hover:text-white"
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute right-0 top-0 h-full w-[2px] bg-[#3984ff]" />
                  )}

                  <Icon
                    size={16}
                    strokeWidth={1.7}
                    className={
                      isActive
                        ? "text-[#3984ff]"
                        : "text-[#c9ccd0] group-hover:text-white"
                    }
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="shrink-0 border-t border-[#24272c] pb-4 pt-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-[40px] items-center gap-3 px-4 text-[12px] font-medium text-[#d1d3d6] hover:bg-[#202328] hover:text-white"
            >
              <Settings size={16} strokeWidth={1.7} />
              <span>Settings</span>
            </Link>

            <Link
              href="/dashboard/help"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-[40px] items-center gap-3 px-4 text-[12px] font-medium text-[#d1d3d6] hover:bg-[#202328] hover:text-white"
            >
              <CircleHelp size={17} strokeWidth={1.7} />
              <span>Help center</span>
            </Link>
          </div>
        </aside>

        {/* =========================================================
            MAIN AREA
        ========================================================= */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">

          {/* =======================================================
              HEADER
          ======================================================= */}
          <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#eceef0] px-3 sm:px-4 lg:px-6">

            {/* Left */}
            <div className="flex min-w-0 items-center gap-2">

              {/* Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-md
                  text-[#44484e]
                  hover:bg-[#f5f6f7]
                  md:hidden
                "
              >
                <Menu size={20} />
              </button>

              <h1 className="truncate text-[16px] font-semibold tracking-[-0.2px] text-[#25282d] sm:text-[17px]">
                Dashboard
              </h1>
            </div>

            {/* Right */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

              {/* New Entry */}
              <button
                type="button"
                className="
                  flex h-[30px] shrink-0
                  items-center justify-center
                  gap-1
                  rounded-full
                  bg-[#3d82f6]
                  px-3
                  text-[10px]
                  font-medium
                  text-white
                  whitespace-nowrap
                  transition
                  hover:bg-[#3275e8]
                  sm:px-4
                  sm:text-[11px]
                "
              >
                <span className="hidden xs:inline sm:inline">
                  New entry
                </span>

                <span className="sm:hidden">
                  New
                </span>

                <Plus
                  size={13}
                  strokeWidth={2}
                />
              </button>

              {/* Notification */}
              <button
                type="button"
                aria-label="Notifications"
                className="
                  flex h-[30px] w-[30px] shrink-0
                  items-center justify-center
                  rounded-full
                  border border-[#e7e9ec]
                  bg-white
                  text-[#44484e]
                  hover:bg-[#f7f8f9]
                "
              >
                <Bell
                  size={13}
                  strokeWidth={1.7}
                />
              </button>

              {/* Search */}
              <button
                type="button"
                aria-label="Search"
                className="
                  flex h-[30px] w-[30px] shrink-0
                  items-center justify-center
                  rounded-full
                  border border-[#e7e9ec]
                  bg-white
                  text-[#44484e]
                  hover:bg-[#f7f8f9]
                "
              >
                <Search
                  size={13}
                  strokeWidth={1.7}
                />
              </button>

              {/* Avatar */}
              <button
                type="button"
                aria-label="Profile"
                className="shrink-0"
              >
                <div className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#c5b09d] text-[10px] font-semibold text-white">
                  P
                </div>
              </button>
            </div>
          </header>

          {/* =======================================================
              TOOLBAR
          ======================================================= */}
          <div
            className="
              flex h-[47px] shrink-0
              items-center justify-between
              gap-2
              border-b border-[#eceef0]
              px-3 sm:px-4 lg:px-6
            "
          >
            {/* Left */}
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

              {/* Filter */}
              <button
                type="button"
                className="
                  flex h-[30px] shrink-0
                  items-center gap-1.5
                  rounded-full
                  border border-[#e5e7ea]
                  bg-white
                  px-3
                  text-[10px]
                  font-medium
                  text-[#3c4045]
                  sm:text-[11px]
                "
              >
                <span>Filter tasks</span>

                <ListFilter
                  size={11}
                  strokeWidth={1.6}
                  className="text-[#8a9097]"
                />
              </button>

              {/* Sort */}
              <button
                type="button"
                className="
                  flex h-[30px] shrink-0
                  items-center gap-1.5
                  rounded-full
                  border border-[#e5e7ea]
                  bg-white
                  px-3
                  text-[10px]
                  font-medium
                  text-[#3c4045]
                  sm:text-[11px]
                "
              >
                <span>Sort tasks</span>

                <ChevronDown
                  size={11}
                  strokeWidth={1.6}
                  className="text-[#8a9097]"
                />
              </button>

              {/* Search field - desktop/tablet */}
              <div
                className="
                  hidden
                  h-[30px]
                  w-[180px]
                  items-center
                  rounded-full
                  border border-[#e5e7ea]
                  px-3
                  md:flex
                "
              >
                <input
                  type="text"
                  placeholder="Try 'Miami beachhouse'"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-[10px]
                    text-[#33373d]
                    outline-none
                    placeholder:text-[8px]
                    placeholder:text-[#b6bbc1]
                  "
                />

                <Search
                  size={12}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#656b73]"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

              {/* Customise - desktop */}
              <button
                type="button"
                className="
                  hidden h-[30px]
                  items-center gap-2
                  rounded-full
                  border border-[#e5e7ea]
                  bg-white
                  px-3
                  text-[10px]
                  font-medium
                  text-[#3c4045]
                  sm:flex
                "
              >
                <span>Customise</span>

                <SlidersHorizontal
                  size={12}
                  strokeWidth={1.6}
                  className="text-[#8a9097]"
                />
              </button>

              {/* More */}
              <button
                type="button"
                aria-label="More options"
                className="
                  flex h-[30px] w-[30px] shrink-0
                  items-center justify-center
                  rounded-full
                  border border-[#e5e7ea]
                  bg-white
                  text-[#3f444a]
                "
              >
                <MoreVertical
                  size={13}
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </div>

          {/* =======================================================
              CONTENT
          ======================================================= */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8f9fb]">

            <div className="w-full p-5 sm:p-6 lg:p-8">

              <h1
                className="
                  text-[22px]
                  font-semibold
                  tracking-[-0.5px]
                  text-[#25282d]
                  sm:text-[26px]
                  lg:text-[28px]
                "
              >
                Vendor Dashboard
              </h1>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}