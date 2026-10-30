import {
  Building2,
  Users,
  Landmark,
  Wallet,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

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
  {
    id: "centros-de-custo",
    label: "Centros de custo",
    to: "/centros-de-custo",
    icon: FolderTree,
  },
  {
    id: "formas-de-recebimento",
    label: "Formas de recebimento",
    to: "/formas-de-recebimento",
    icon: Wallet,
  },
  { id: "clientes", label: "Clientes", to: "/clientes", icon: Building2 },
  {
    id: "contas-bancarias",
    label: "Contas bancárias",
    to: "/contas-bancarias",
    icon: Landmark,
  },
  { id: "usuarios", label: "Usuários", to: "/usuarios", icon: Users },
];
