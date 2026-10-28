import { RouterProvider } from "react-router/dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { router } from "@/router/app-router";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
