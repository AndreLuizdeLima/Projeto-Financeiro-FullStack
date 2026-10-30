import { matchPath, useLocation } from "react-router";
import { useSidebar } from "@/components/ui/sidebar";
import { navigationItems } from "../model/navigation";

export const usePageSidebarViewModel = () => {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const items = navigationItems.map((item) => ({
    ...item,
    isActive: !!matchPath({ path: item.to, end: true }, pathname),
  }));

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return { items, handleNavigate };
};
