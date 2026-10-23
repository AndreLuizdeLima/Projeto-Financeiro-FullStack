import { createContext } from "react";
import type { AuthState } from "./session";
import { authSession } from "./session";

export const AuthContext = createContext<
  | (AuthState &
      Pick<
        typeof authSession,
        "login" | "logout" | "request" | "getGeneration"
      >)
  | null
>(null);
