import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePageSidebarViewModel } from "../view-model/usePageSidebarViewModel";

const SidebarView = () => {
  const { items, handleNavigate } = usePageSidebarViewModel();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="md:top-(--header-height) md:h-[calc(100svh-var(--header-height))]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Navegação principal">
              <SidebarMenu>
                {items.map(({ id, label, to, icon: Icon, isActive }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={label}
                      className="text-sidebar-foreground"
                      render={
                        <Link
                          to={to}
                          aria-current={isActive ? "page" : undefined}
                          onClick={handleNavigate}
                        />
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarView;
