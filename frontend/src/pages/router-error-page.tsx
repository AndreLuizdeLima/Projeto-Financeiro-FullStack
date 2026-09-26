import { Home, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routePaths } from "@/routes/route-paths";

function RouterErrorPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10 sm:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b-2 border-border">
          <p className="font-mono text-sm font-bold tracking-[0.18em] text-destructive">
            ERRO NA APLICAÇÃO
          </p>
          <CardTitle className="mt-3 text-4xl font-black tracking-tighter">
            Não foi possível carregar esta tela.
          </CardTitle>
          <CardDescription className="mt-3 text-base leading-6">
            Tente novamente. Se o problema continuar, volte ao início e recomece
            sua navegação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <Link to={routePaths.home}>
              <Home aria-hidden="true" />
              Ir para o início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export { RouterErrorPage };
