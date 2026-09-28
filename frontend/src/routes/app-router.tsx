import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { LoginPage } from "@/app/auth/page/login-page";
import { CentrosDeCustoPage } from "@/app/centros-de-custo/page/centros-de-custo-page";
import { ClientesPage } from "@/app/clientes/page/clientes-page";
import { ContasBancariasPage } from "@/app/contas-bancarias/page/contas-bancarias-page";
import { DashboardPage } from "@/app/dashboard/page/dashboard-page";
import { FormasRecebimentoPage } from "@/app/formas-recebimento/page/formas-recebimento-page";
import { AppLayoutPage } from "@/app/layout/page/app-layout-page";
import { UsersPage } from "@/app/users/page/users-page";
import { NotFoundPage } from "@/app/system/page/not-found-page";
import { RouterErrorPage } from "@/app/system/page/router-error-page";
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards";
import { routePaths } from "@/routes/route-paths";

const routeDefinitions = {
  app: {
    path: routePaths.home,
    element: (
      <ProtectedRoute>
        <AppLayoutPage />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: routePaths.users,
        element: <UsersPage />,
      },
      {
        path: routePaths.clientes,
        element: <ClientesPage />,
      },
      {
        path: routePaths.formasRecebimento,
        element: <FormasRecebimentoPage />,
      },
      {
        path: routePaths.centrosDeCusto,
        element: <CentrosDeCustoPage />,
      },
      {
        path: routePaths.contasBancarias,
        element: <ContasBancariasPage />,
      },
    ],
  },
  login: {
    path: routePaths.login,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  notFound: {
    path: "*",
    element: <NotFoundPage />,
  },
} satisfies Record<string, RouteObject>;

const appRouter = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouterErrorPage />,
    children: Object.values(routeDefinitions),
  },
]);

export { appRouter, routeDefinitions, routePaths };
