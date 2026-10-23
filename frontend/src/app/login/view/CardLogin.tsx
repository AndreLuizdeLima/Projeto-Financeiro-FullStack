import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCardLogin } from "../view-model/useCardLogin";

const CardLogin = () => {
  const { formValue, handleSetFormValue, submitForm, isSubmitting } =
    useCardLogin();

  return (
    <Card className="w-full max-w-md gap-8 p-6 shadow-xl sm:p-10">
      <div className="flex justify-center">
        <img
          src="/data/fluxo-logo-login.png"
          alt="Fluxo"
          className="h-20 max-w-full object-contain"
        />
      </div>
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submitForm();
        }}
        aria-busy={isSubmitting}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            value={formValue.email ?? ""}
            onChange={(event) =>
              handleSetFormValue("email", event.target.value)
            }
            type="email"
            autoComplete="email"
            placeholder="seu-email@exemplo.com"
            className="h-11 bg-background px-3 text-base"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            value={formValue.password ?? ""}
            onChange={(event) =>
              handleSetFormValue("password", event.target.value)
            }
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="h-11 bg-background px-3 text-base"
            required
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 h-11 w-full text-sm font-semibold"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </Card>
  );
};

export default CardLogin;
