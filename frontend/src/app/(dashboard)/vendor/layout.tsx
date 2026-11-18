"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Sidebar, { type NavigationItem } from "@/components/dashboard/Sidebar";

import Navbar from "@/components/dashboard/Navbar";
import { getAuthSession } from "@/features/auth/auth.utils";
import { getVendorVerification } from "@/features/vendor/vendor.api";

const sellerPaths = ["/vendor/inventory"];

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
  {
    label: "Business verification",
    href: "/vendor/verification",
    icon: "verified_user",
  },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    const token = getAuthSession("VENDOR")?.token;
    void (async () => {
      if (!token) { await Promise.resolve(); if (mounted) setChecking(false); return; }
      try { const data = await getVendorVerification(token); if (mounted) setApproved(data.verificationStatus === "APPROVED" && data.user.status === "ACTIVE"); }
      catch { if (mounted) setApproved(false); }
      finally { if (mounted) setChecking(false); }
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!checking && !approved && sellerPaths.some((path) => pathname.startsWith(path))) router.replace("/vendor/verification");
  }, [approved, checking, pathname, router]);
  const navigation = useMemo(() => approved ? vendorNavigation : vendorNavigation.filter((item) => item.href !== "/vendor/inventory"), [approved]);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar
          navigation={navigation}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Navbar */}
          <Navbar setMobileMenuOpen={setMobileMenuOpen} />

          

          {/* Page Content */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white">
            {checking && sellerPaths.some((path) => pathname.startsWith(path)) ? <main className="p-8 text-sm text-slate-600">Checking seller access…</main> : !checking && !approved && sellerPaths.some((path) => pathname.startsWith(path)) ? <main className="p-8 text-sm text-slate-600">Redirecting to business verification…</main> : children}
          </div>
        </section>
      </div>
    </main>
  );
}
