/** Formata dígitos como centavos em reais, sem conversão para ponto flutuante. */
export const mascaraValor = (valor: string): string => {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "";
  const centavos = digitos.replace(/^0+(?=\d)/, "").padStart(3, "0");
  const inteiro = centavos.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${inteiro},${centavos.slice(-2)}`;
};
