import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { LoginPage } from "@/app/auth/page/login-page";
import { DashboardPage } from "@/app/dashboard/page/dashboard-page";
import { AppLayoutPage } from "@/app/layout/page/app-layout-page";
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
