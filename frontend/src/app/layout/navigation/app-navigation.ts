import { House, type LucideIcon } from 'lucide-react'
import { routePaths } from '@/routes/route-paths'

type AppNavigationItem = {
  name: string
  icon: LucideIcon
  route: string
  title: string
}

const appNavigation: AppNavigationItem[] = [
  {
    name: 'Início',
    icon: House,
    route: routePaths.home,
    title: 'Visão geral',
  },
]

export { appNavigation, type AppNavigationItem }
