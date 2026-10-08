import {
  Building2,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  House,
  Landmark,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { routePaths } from "@/routes/route-paths";

type AppNavigationItem = {
  name: string;
  icon: LucideIcon;
  route: string;
  title: string;
};

const appNavigation: AppNavigationItem[] = [
  {
    name: "Início",
    icon: House,
    route: routePaths.home,
    title: "Visão geral",
  },

  {
    name: "Cadastro de clientes",
    icon: Building2,
    route: routePaths.clientes,
    title: "Cadastro de clientes",
  },
  {
    name: "Formas de recebimento",
    icon: CircleDollarSign,
    route: routePaths.formasRecebimento,
    title: "Formas de recebimento",
  },
  {
    name: "Centros de Custo",
    icon: ChartNoAxesColumnIncreasing,
    route: routePaths.centrosDeCusto,
    title: "Centros de custo",
  },
  {
    name: "Cadastros de Contas",
    icon: Landmark,
    route: routePaths.contasBancarias,
    title: "Contas bancárias",
  },
  {
    name: "Usuários",
    icon: UsersRound,
    route: routePaths.users,
    title: "Cadastro de usuários",
  },
];

export { appNavigation, type AppNavigationItem };
