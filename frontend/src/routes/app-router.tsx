import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouterErrorPage } from "@/pages/router-error-page";
import { ProtectedRoute, PublicRoute } from "@/routes/route-guards";
import { routePaths } from "@/routes/route-paths";

const routeDefinitions = {
  home: {
    path: routePaths.home,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
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
