import { Landmark, LogOut } from "lucide-react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/app/layout/components/app-sidebar";
import { useAuth } from "@/auth/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AppLayoutPage() {
  const { logout } = useAuth();

  return (
    <div className="grid h-svh overflow-hidden grid-rows-[auto_minmax(0,1fr)_auto] bg-background md:grid-cols-[7rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]">
      <header className="z-20 flex min-h-18 flex-wrap items-center justify-between gap-4 border-b-2 border-border bg-card px-5 py-4 md:col-span-2 md:px-8">
        <div className="flex items-center gap-3">
          <Landmark className="size-8" aria-hidden="true" />
          <div>
            <Badge className="mb-1">Sistema financeiro</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut aria-hidden="true" />
            Sair
          </Button>
        </div>
      </header>

      <aside className="hidden border-r-2 border-border bg-card md:block">
        <AppSidebar variant="desktop" />
      </aside>

      <main className="min-h-0 min-w-0 overflow-y-auto px-5 py-8 sm:px-8">
        <Outlet />
      </main>

      <AppSidebar variant="mobile" />
    </div>
  );
}

export { AppLayoutPage };
