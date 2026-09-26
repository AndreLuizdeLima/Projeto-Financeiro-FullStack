import { Home } from "lucide-react";
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

function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-10 sm:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b-2 border-border">
          <p className="font-mono text-sm font-bold tracking-[0.18em] text-muted-foreground">
            ERRO 404
          </p>
          <CardTitle className="mt-3 text-4xl font-black tracking-tighter">
            Esta página não existe.
          </CardTitle>
          <CardDescription className="mt-3 text-base leading-6">
            Verifique o endereço informado ou retorne ao início do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button asChild>
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

export { NotFoundPage };
