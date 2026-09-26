import { House, UsersRound, type LucideIcon } from 'lucide-react'
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
  {
    name: 'Usuários',
    icon: UsersRound,
    route: routePaths.users,
    title: 'Cadastro de usuários',
  },
]

export { appNavigation, type AppNavigationItem }
