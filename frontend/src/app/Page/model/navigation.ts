import { LayoutDashboard, type LucideIcon } from "lucide-react";

export type NavigationItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
];
