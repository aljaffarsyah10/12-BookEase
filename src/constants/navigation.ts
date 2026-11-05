import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  Settings,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
}

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { title: "Beranda", href: "/" },
  { title: "Fitur", href: "/features" },
  { title: "Harga", href: "/pricing" },
  { title: "Demo Booking", href: "/book/glow-beauty-studio" },
];

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Sparkles,
  },
  {
    title: "Staff",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
  },
  {
    title: "Business Profile",
    href: "/dashboard/business",
    icon: Store,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

