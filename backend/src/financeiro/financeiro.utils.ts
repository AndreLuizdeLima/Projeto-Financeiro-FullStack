import Big from 'big.js';
import { BadRequestException } from '@nestjs/common';

export function hoje(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.FINANCEIRO_TIMEZONE || 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function dinheiro(valor: string): string {
  const n = new Big(valor);
  if (n.lt(0) || n.gt('99999999999999999.99'))
    throw new BadRequestException('Valor monetário fora do limite.');
  return n.toFixed(2, Big.roundHalfUp);
}

export function calcularLiquidacao(
  valor: string,
  vencimento: string,
  pagamento: string,
  taxaJurosDiaria = '0',
  taxaMulta = '0',
) {
  const diasAtraso = Math.max(
    0,
    Math.round((Date.parse(pagamento) - Date.parse(vencimento)) / 86400000),
  );
  const juros = dinheiro(
    new Big(valor).times(taxaJurosDiaria).times(diasAtraso).div(100).toString(),
  );
  const multa = dinheiro(
    diasAtraso > 0 ? new Big(valor).times(taxaMulta).div(100).toString() : '0',
  );
  return {
    diasAtraso,
    juros,
    multa,
    valorTotal: dinheiro(new Big(valor).plus(juros).plus(multa).toString()),
  };
}
