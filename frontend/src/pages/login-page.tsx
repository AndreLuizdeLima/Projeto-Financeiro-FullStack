import { type FormEvent, useState } from "react";
import axios from "axios";
import { Landmark, LockKeyhole, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useLoginMutation } from "@/auth/hooks/use-login-mutation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routePaths } from "@/routes/route-paths";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

function getRedirectPath(state: unknown) {
  if (typeof state !== "object" || state === null) {
    return routePaths.home;
  }

  const from = (state as LocationState).from?.pathname;
  return from?.startsWith("/") && !from.startsWith("//")
    ? from
    : routePaths.home;
}

function getLoginErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Não foi possível iniciar sua sessão. Tente novamente.";
  }

  const message = error.response?.data?.message;

  if (typeof message === "string") {
    return message;
  }

  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === "string")
  ) {
    return message.join(" ");
  }

  return "Não foi possível iniciar sua sessão. Verifique sua conexão e tente novamente.";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const redirectPath = getRedirectPath(location.state);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate(redirectPath, { replace: true });
    } catch {
      // The mutation error is presented next to the form fields.
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-5 py-10 sm:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b-2 border-border">
          <Badge className="mb-4 w-fit">Sistema financeiro</Badge>
          <CardTitle className="text-4xl font-black tracking-tighter">
            Acesse sua conta.
          </CardTitle>
          <CardDescription className="mt-3 text-base leading-6">
            Entre para acompanhar a operação financeira do seu negócio.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <Mail className="size-4" aria-hidden="true" />
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                required
                placeholder="voce@empresa.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <LockKeyhole className="size-4" aria-hidden="true" />
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                placeholder="Sua senha"
              />
            </div>

            {loginMutation.isError ? (
              <p
                className="border-2 border-destructive bg-destructive px-3 py-2 text-sm font-bold text-destructive-foreground"
                role="alert"
              >
                {getLoginErrorMessage(loginMutation.error)}
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={loginMutation.isPending}
            >
              <Landmark aria-hidden="true" />
              {loginMutation.isPending ? "Entrando..." : "Entrar no sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export { LoginPage };
