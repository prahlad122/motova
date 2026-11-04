import type { NavigationItem } from "@/components/dashboard/Sidebar";
export const adminNavigation: NavigationItem[] = [
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
    href: "/admin/categories",
    icon: "Category",
    children: [{ label: "All Categories", href: "/admin/categories" }],
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
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Sales & Revenue", href: "/admin/analytics/sales" },
      { label: "Vendor Performance", href: "/admin/analytics/vendors" },
      { label: "Product Performance", href: "/admin/analytics/products" },
      { label: "Customer Analytics", href: "/admin/analytics/customers" },
      { label: "Inventory Analytics", href: "/admin/analytics/inventory" },
    ],
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

