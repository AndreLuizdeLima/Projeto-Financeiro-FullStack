import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/auth/useAuth";
import { ApiError } from "@/lib/http";
import { toast } from "@/components/ui/toast";
import { login } from "../model/login";

type FormValueInputType = { email: string; password: string };

export const useCardLogin = () => {
  const [formValue, setFormValue] = useState<FormValueInputType>({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pending = useRef(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const handleSetFormValue = useCallback(
    (key: keyof FormValueInputType, value: string) => {
      setFormValue((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  async function submitForm() {
    if (pending.current) return;
    pending.current = true;
    setIsSubmitting(true);
    const generation = auth.getGeneration();
    try {
      const tokens = await login(formValue);
      if (auth.login(tokens, generation)) navigate("/", { replace: true });
    } catch (cause) {
      if (auth.getGeneration() === generation)
        toast.add({
          type: "error",
          title: "Erro ao fazer login",
          description: cause instanceof ApiError
            ? cause.message
            : "Não foi possível entrar. Tente novamente.",
        });
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }

  return { formValue, handleSetFormValue, submitForm, isSubmitting };
};
