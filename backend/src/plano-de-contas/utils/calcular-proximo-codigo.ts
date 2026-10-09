import { UnprocessableEntityException } from '@nestjs/common';
import { MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS } from '../plano-de-contas.constants';

function validarCodigo(codigo: string): void {
  if (
    typeof codigo !== 'string' ||
    codigo.length > MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS ||
    codigo.trim() !== codigo ||
    !/^[1-9]\d*(?:\.[1-9]\d*)*$/.test(codigo)
  ) {
    throw new UnprocessableEntityException(
      'O código deve conter segmentos inteiros positivos, sem zeros à esquerda, e ter no máximo 255 caracteres.',
    );
  }
}

export function extrairNumeroDoFilho(
  codigo: string,
  codigoPai: string,
): bigint {
  validarCodigo(codigoPai);
  validarCodigo(codigo);

  const prefixo = `${codigoPai}.`;
  const numero = codigo.slice(prefixo.length);
  if (!codigo.startsWith(prefixo) || !/^[1-9]\d*$/.test(numero)) {
    throw new UnprocessableEntityException(
      'O código da conta é incompatível com a hierarquia existente.',
    );
  }
  return BigInt(numero);
}

export function calcularProximoCodigo(
  codigoPai: string,
  codigosDosFilhos: readonly string[],
): string {
  validarCodigo(codigoPai);
  const maiorNumero = codigosDosFilhos.reduce((maior, codigo) => {
    const numero = extrairNumeroDoFilho(codigo, codigoPai);
    return numero > maior ? numero : maior;
  }, 0n);

  const codigo = `${codigoPai}.${maiorNumero + 1n}`;
  validarCodigo(codigo);
  return codigo;
}
