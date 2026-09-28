import { NavLink } from 'react-router'
import { appNavigation, type AppNavigationItem } from '@/app/layout/navigation/app-navigation'
import { cn } from '@/lib/utils'

type AppSidebarProps = {
  variant: 'desktop' | 'mobile'
}

function navigationItemClassName(variant: AppSidebarProps['variant']) {
  return ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center justify-center gap-2 rounded-md border border-transparent font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      variant === 'desktop'
        ? 'mx-2 flex-col px-2 py-3 text-center text-xs'
        : 'h-full min-w-22 flex-1 flex-col px-2 py-2 text-[0.65rem]',
      isActive
        ? 'border-border bg-secondary text-secondary-foreground'
        : 'text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground',
    )
}

function NavigationItem({ item, variant }: { item: AppNavigationItem; variant: AppSidebarProps['variant'] }) {
  const Icon = item.icon

  return (
    <NavLink to={item.route} end className={navigationItemClassName(variant)}>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span>{item.name}</span>
    </NavLink>
  )
}

function AppSidebar({ variant }: AppSidebarProps) {
  const isDesktop = variant === 'desktop'

  return (
    <nav
      className={cn(
        isDesktop
          ? 'hidden h-full flex-col py-4 md:flex'
          : 'z-40 flex h-18 overflow-x-auto border-t border-border bg-card md:hidden',
      )}
      aria-label="Navegação principal"
    >
      {appNavigation.map((item) => (
        <NavigationItem key={item.route} item={item} variant={variant} />
      ))}
    </nav>
  )
}

export { AppSidebar }
