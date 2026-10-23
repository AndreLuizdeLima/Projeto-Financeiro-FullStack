import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/auth/useAuth";
import { Loading } from "@/components/loading/Loading";

export function SessionGate({ publicOnly = false }: { publicOnly?: boolean }) {
  const { status } = useAuth();
  if (status === "restoring")
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <Loading
          title="Restaurando sessão"
          description="Buscando sua sessão. Aguarde um momento…"
        />
      </main>
    );
  if (publicOnly)
    return status === "authenticated" ? (
      <Navigate to="/" replace />
    ) : (
      <Outlet />
    );
  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
