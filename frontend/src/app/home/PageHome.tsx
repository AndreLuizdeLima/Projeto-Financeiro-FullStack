import { Outlet, useOutlet } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";

const PageHome = () => {
  const { logout } = useAuth();
  const child = useOutlet();
  return (
    <div className="min-h-svh bg-background">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <span className="font-semibold">Fluxo</span>
        <Button variant="outline" onClick={logout}>
          Sair
        </Button>
      </header>
      <main className="p-6">
        {child ? <Outlet /> : <h1 className="text-2xl font-semibold">Home</h1>}
      </main>
    </div>
  );
};

export default PageHome;
