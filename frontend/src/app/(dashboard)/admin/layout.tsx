
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";
import { adminNavigation } from "@/features/admin/admin.navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const isDashboard = pathname === "/admin/dashboard";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#f8f9fb]">
      {/* Sidebar */}
      <Sidebar
        navigation={adminNavigation}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f9fb]">
        {/* Navbar */}
        <Navbar setMobileMenuOpen={setMobileMenuOpen} />

        {/* Toolbar ONLY on Dashboard */}
        {isDashboard && <DashboardToolbar />}

        {/* Scrollable Page Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
