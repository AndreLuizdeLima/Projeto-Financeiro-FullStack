import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/auth/use-auth";
import { SessionLoadingScreen } from "@/components/session-loading-screen";
import { routePaths } from "@/routes/route-paths";

function ProtectedRoute({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <SessionLoadingScreen />;
  }

  if (status !== "authenticated") {
    return (
      <Navigate to={routePaths.login} replace state={{ from: location }} />
    );
  }

  return children;
}

function PublicRoute({ children }: PropsWithChildren) {
  const { status } = useAuth();

  if (status === "loading") {
    return <SessionLoadingScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to={routePaths.home} replace />;
  }

  return children;
}

export { ProtectedRoute, PublicRoute };
