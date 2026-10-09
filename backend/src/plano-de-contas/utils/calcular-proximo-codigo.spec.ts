import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { calcularProximoCodigo } from './calcular-proximo-codigo';

describe('calcularProximoCodigo', () => {
  it.each([
    ['1', [], '1.1'],
    ['1', ['1.1', '1.4'], '1.5'],
    ['1', ['1.9', '1.2'], '1.10'],
    ['1.2', ['1.2.1', '1.2.2'], '1.2.3'],
    ['1', ['1.9007199254740993'], '1.9007199254740994'],
  ] as const)(
    'calcula o próximo filho de %s entre %j',
    (pai, filhos, esperado) => {
      expect(calcularProximoCodigo(pai, filhos)).toBe(esperado);
    },
  );

  it('não modifica os argumentos nem reordena a lista de filhos', () => {
    const filhos = Object.freeze(['1.9', '1.2', '1.5']);
    expect(calcularProximoCodigo('1', filhos)).toBe('1.10');
    expect(filhos).toEqual(['1.9', '1.2', '1.5']);
  });

  it.each([
    '',
    '0',
    '01',
    '1.',
    '.1',
    '1..2',
    '1.0',
    '1.02',
    '1.a',
    ' 1',
    '1\n',
  ])('rejeita formato inválido no código do pai: %j', (pai) => {
    expect(() => calcularProximoCodigo(pai, [])).toThrow(
      UnprocessableEntityException,
    );
  });

  it.each([
    '2.1',
    '11.1',
    '1.1.1',
    '1.0',
    '1.01',
    '1.-1',
    '1.1.5',
    '1.',
    '1',
    '1.2\n',
  ])(
    'rejeita código que não representa um filho direto válido: %j',
    (codigo) => {
      expect(() => calcularProximoCodigo('1', [codigo])).toThrow(
        UnprocessableEntityException,
      );
    },
  );

  it('rejeita código cujo prefixo coincide parcialmente com o pai', () => {
    expect(() => calcularProximoCodigo('1.2', ['1.20.1'])).toThrow(
      UnprocessableEntityException,
    );
  });

  it('aceita o código gerado no limite de 255 caracteres', () => {
    const pai = '1'.repeat(253);
    expect(calcularProximoCodigo(pai, [])).toBe(`${pai}.1`);
  });

  it('rejeita um pai maior que 255 caracteres', () => {
    expect(() => calcularProximoCodigo('1'.repeat(256), [])).toThrow(
      UnprocessableEntityException,
    );
  });

  it('rejeita filho existente maior que 255 caracteres', () => {
    expect(() => calcularProximoCodigo('1', [`1.${'1'.repeat(254)}`])).toThrow(
      UnprocessableEntityException,
    );
  });

  it('rejeita um primeiro filho que excederia 255 caracteres', () => {
    expect(() => calcularProximoCodigo('1'.repeat(254), [])).toThrow(
      UnprocessableEntityException,
    );
  });

  it('rejeita o crescimento do sufixo quando ultrapassa 255 caracteres', () => {
    const pai = '1'.repeat(253);
    expect(() => calcularProximoCodigo(pai, [`${pai}.9`])).toThrow(
      UnprocessableEntityException,
    );
  });
});
