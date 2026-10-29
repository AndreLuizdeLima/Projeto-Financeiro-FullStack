import { describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { calcularLiquidacao, dinheiro } from './financeiro.utils';

describe('Cálculos financeiros', () => {
  it.each(['2026-10-09', '2026-10-10'])(
    'não cobra encargos no pagamento em %s',
    (pagamento) => {
      expect(
        calcularLiquidacao('1000.00', '2026-10-10', pagamento, '0.1', '2'),
      ).toEqual({
        diasAtraso: 0,
        juros: '0.00',
        multa: '0.00',
        valorTotal: '1000.00',
      });
    },
  );
  it('cobra juros diários e multa uma única vez', () => {
    expect(
      calcularLiquidacao('1000.00', '2026-10-10', '2026-10-13', '0.1', '2'),
    ).toEqual({
      diasAtraso: 3,
      juros: '3.00',
      multa: '20.00',
      valorTotal: '1023.00',
    });
  });
  it('conta dias na passagem de mês e ano bissexto', () => {
    expect(
      calcularLiquidacao('100', '2024-02-28', '2024-03-01', '1', '0'),
    ).toEqual({
      diasAtraso: 2,
      juros: '2.00',
      multa: '0.00',
      valorTotal: '102.00',
    });
  });
  it('não cobra encargos quando as taxas são omitidas', () => {
    expect(calcularLiquidacao('100', '2026-10-01', '2026-10-10')).toEqual({
      diasAtraso: 9,
      juros: '0.00',
      multa: '0.00',
      valorTotal: '100.00',
    });
  });
  it('arredonda cada encargo antes de somar ao principal', () => {
    expect(
      calcularLiquidacao('1.00', '2026-10-01', '2026-10-02', '0.5', '0.5'),
    ).toEqual({
      diasAtraso: 1,
      juros: '0.01',
      multa: '0.01',
      valorTotal: '1.02',
    });
  });
  it.each([
    ['1.005', '1.01'],
    ['0', '0.00'],
    ['99999999999999999.99', '99999999999999999.99'],
  ])('formata %s sem perder precisão', (valor, esperado) => {
    expect(dinheiro(valor)).toBe(esperado);
  });
  it.each(['-0.01', '100000000000000000'])(
    'rejeita dinheiro fora do limite: %s',
    (valor) => {
      expect(() => dinheiro(valor)).toThrow(BadRequestException);
    },
  );
});
