"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import Sidebar, { type NavigationItem } from "@/components/dashboard/Sidebar";

import Navbar from "@/components/dashboard/Navbar";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";

const vendorNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: "Dashboard",
  },
  {
    label: "My Items",
    href: "/vendor/inventory",
    icon: "List_Alt",
  },
  {
    label: "Orders",
    href: "/vendor/orders",
    icon: "Box",
  },
  {
    label: "Notifications",
    href: "/vendor/notifications",
    icon: "notifications",
  },
  {
    label: "Analytics",
    href: "/vendor/analytics",
    icon: "Bar_Chart",
  },
  {
    label: "Consumer View",
    href: "/vendor/consumer-view",
    icon: "Group",
  },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  const isDashboard = pathname === "/vendor/dashboard";

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar
          navigation={vendorNavigation}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Navbar */}
          <Navbar setMobileMenuOpen={setMobileMenuOpen} />

          {/* Toolbar ONLY on dashboard */}
          {isDashboard && <DashboardToolbar />}

          {/* Page Content */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
