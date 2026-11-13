import PageCentroDeCusto from "@/app/centros-de-custo/PageCentroDeCusto";
import PagePlanoDeContas from "@/app/plano-de-contas/PagePlanoDeContas";
import PageFormaRecebimento from "@/app/formas-de-recebimento/PageFormaRecebimento";
import PageCliente from "@/app/clientes/PageCliente";
import PageContaBancaria from "@/app/contas-bancarias/PageContaBancaria";
import PageUsuario from "@/app/usuarios/PageUsuario";
import { createBrowserRouter, Navigate } from "react-router";
import { SessionGate } from "./SessionGate";
import LoginPage from "@/app/login/LoginPage";
import PageHome from "@/app/Page/PageHome";
import PageDashboard from "@/app/dashboard/PageDashboard";
import PageContasPagar from "@/app/contas/PageContasPagar";
import PageContasReceber from "@/app/contas/PageContasReceber";

export const router = createBrowserRouter([
  {
    element: <SessionGate publicOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <SessionGate />,
    children: [
      {
        path: "/",
        element: <PageHome />,
        children: [
          { path: "contas-a-pagar", element: <PageContasPagar /> },
          { path: "contas-a-receber", element: <PageContasReceber /> },
          { path: "centros-de-custo", element: <PageCentroDeCusto /> },
          { path: "plano-de-contas", element: <PagePlanoDeContas /> },
          { path: "formas-de-recebimento", element: <PageFormaRecebimento /> },
          { path: "clientes", element: <PageCliente /> },
          { path: "contas-bancarias", element: <PageContaBancaria /> },
          { path: "usuarios", element: <PageUsuario /> },
          {
            index: true,
            element: <PageDashboard />,
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
