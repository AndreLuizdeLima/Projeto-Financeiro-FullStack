import { useState } from "react";

export type Erros<T> = Partial<Record<keyof T, string>>;
export const useFormulario = <T extends object>(
  inicial: T,
  validar: (valores: T) => Erros<T>,
) => {
  const [valores, setValores] = useState(inicial);
  const [erros, setErros] = useState<Erros<T>>({});
  const alterar = <K extends keyof T>(campo: K, valor: T[K]) => {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };
  const validarFormulario = () => {
    const resultado = validar(valores);
    setErros(resultado);
    return Object.keys(resultado).length === 0;
  };
  return { valores, erros, alterar, validarFormulario };
};
export const obrigatorio = (valor: string, max?: number) =>
  !valor.trim()
    ? "Preencha este campo."
    : max && valor.length > max
      ? `Use até ${max} caracteres.`
      : undefined;
