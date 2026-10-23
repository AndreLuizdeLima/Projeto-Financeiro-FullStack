import { createBrowserRouter, Navigate } from "react-router";
import { SessionGate } from "./SessionGate";
import LoginPage from "@/app/login/LoginPage";
import PageHome from "@/app/home/PageHome";

export const router = createBrowserRouter([
  {
    element: <SessionGate publicOnly />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <SessionGate />,
    children: [{ path: "/", element: <PageHome />, children: [] }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
