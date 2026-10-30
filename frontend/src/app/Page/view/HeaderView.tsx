import AvatarIcon from "@/components/AvatarIcon";
import { SidebarTrigger } from "@/components/ui/sidebar";

const HeaderView = () => (
  <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b bg-primary px-3 py-4 text-primary-foreground sm:px-6">
    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
      <SidebarTrigger aria-label="Alternar menu lateral" />
      <img
        src="/data/fluxo-logo-texto-branca.png"
        alt="Fluxo"
        className="h-auto max-h-20 w-auto min-w-0 max-w-40 object-contain sm:max-w-none"
      />
    </div>
    <AvatarIcon />
  </header>
);

export default HeaderView;
