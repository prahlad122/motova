"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Icon from "@/components/ui/Icon";

export type NavigationItem = {
  label: string;
  href: string;
  icon: string;
};

type SidebarProps = {
  navigation: NavigationItem[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

export default function Sidebar({
  navigation,
  mobileMenuOpen,
  setMobileMenuOpen,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#17191d] text-white transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:static md:w-[168px] md:shrink-0 md:translate-x-0`}
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

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#c9ccd0] hover:bg-[#24272c] md:hidden"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin/dashboard" ||
              item.href === "/vendor/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex h-[42px] items-center gap-3 px-4 text-[12px] font-medium transition-colors ${isActive ? "bg-[#22252a] text-white" : "text-[#d1d3d6] hover:bg-[#202328] hover:text-white"}`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-[2px] bg-[#3984ff]" />
                )}

                <Icon
                  name={item.icon}
                  filled={isActive}
                  className={`text-[18px] ${isActive ? "text-[#3984ff]" : "text-[#c9ccd0] group-hover:text-white"}`}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="shrink-0 border-t border-[#24272c] pb-4 pt-2">
          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-[40px] items-center gap-3 px-4 text-[12px] font-medium text-[#d1d3d6] hover:bg-[#202328] hover:text-white"
          >
            <Icon name="settings" className="text-[18px]" />

            <span>Settings</span>
          </Link>

          {/* Help Center */}
          <Link
            href="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-[40px] items-center gap-3 px-4 text-[12px] font-medium text-[#d1d3d6] hover:bg-[#202328] hover:text-white"
          >
            <Icon name="help_outline" className="text-[18px]" />

            <span>Help center</span>
          </Link>
        </div>
      </aside>
    </>
  );
}