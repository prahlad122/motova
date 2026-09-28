"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import Sidebar, { type NavigationItem } from "@/components/dashboard/Sidebar";

import Navbar from "@/components/dashboard/Navbar";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar";

const adminNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "Dashboard",
  },
  {
    label: "Vendors",
    href: "/admin/vendors",
    icon: "Storefront",
  },
  {
    label: "Category",
    href: "/admin/category",
    icon: "Category",
  },
  {
    label: "Brands & Items",
    href: "/admin/brands-items",
    icon: "List_Alt",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: "Bar_Chart",
  },
  {
    label: "Approvals",
    href: "/admin/approvals",
    icon: "Order_Approve",
  },
  {
    label: "Documentation",
    href: "/admin/documentation",
    icon: "Assignment",
  },
];
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  const isDashboard = pathname === "/admin/dashboard";

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar
          navigation={adminNavigation}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Navbar */}
          <Navbar setMobileMenuOpen={setMobileMenuOpen} />

          {/* Toolbar ONLY on Dashboard */}
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
