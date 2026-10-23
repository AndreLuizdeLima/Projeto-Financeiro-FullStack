import { Outlet } from "react-router";
import AvatarIcon from "@/components/AvatarIcon";

const PageHome = () => {
  return (
    <div className="min-h-svh bg-background">
      <header className="flex items-center justify-between border-b bg-primary px-6 py-4">
        <div>
          <img src="data/fluxo-logo-texto-branca.png" className="h-20" />
        </div>
        <AvatarIcon />
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PageHome;
