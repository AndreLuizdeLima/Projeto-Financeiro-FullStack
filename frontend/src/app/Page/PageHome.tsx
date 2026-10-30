import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import HeaderView from "./view/HeaderView";
import SidebarView from "./view/SidebarView";

const PageHome = () => {
  return (
    <SidebarProvider className="flex-col bg-background [--header-height:7rem]">
      <HeaderView />
      <div className="flex min-w-0 flex-1">
        <SidebarView />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PageHome;
