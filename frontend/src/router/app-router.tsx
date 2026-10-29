import { createBrowserRouter, Navigate } from "react-router";
import { SessionGate } from "./SessionGate";
import LoginPage from "@/app/login/LoginPage";
import PageHome from "@/app/Page/PageHome";
import PageDashboard from "@/app/dashboard/PageDashboard";

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
