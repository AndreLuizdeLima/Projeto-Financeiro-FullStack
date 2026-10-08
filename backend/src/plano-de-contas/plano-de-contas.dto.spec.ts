import { describe, expect, it } from '@jest/globals';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { UpdatePlanoDeContaDto } from './dto/update-plano-de-conta.dto';
import { NaturezaConta } from './dto/natureza-da-conta';
import { TipoPlanoConta } from './dto/tipo-de-plano.enum';

describe('Validação dos DTOs de plano de contas', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const criacao = {
    nome: 'Estoque',
    tipo: TipoPlanoConta.ATIVO,
    natureza: NaturezaConta.ANALITICA,
    contaPaiId: 101,
  };

  it.each([undefined, null, 0, -1, 1.5, '101'])(
    'rejeita contaPaiId inválido na criação: %s',
    async (contaPaiId) => {
      await expect(
        pipe.transform(
          { ...criacao, contaPaiId },
          { type: 'body', metatype: CreatePlanoDeContaDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it('aceita criação sem código enviado pelo cliente e descarta campos controlados pelo backend', async () => {
    const resultado = (await pipe.transform(
      { ...criacao, codigo: '9.99', isActive: false, criadoPor: { id: 999 } },
      { type: 'body', metatype: CreatePlanoDeContaDto },
    )) as CreatePlanoDeContaDto;
    expect(resultado).toMatchObject(criacao);
    expect(resultado).not.toHaveProperty('codigo');
    expect(resultado).not.toHaveProperty('isActive');
    expect(resultado).not.toHaveProperty('criadoPor');
  });

  it('aceita PATCH parcial sem pai informado', async () => {
    const resultado = (await pipe.transform(
      { nome: 'Novo nome' },
      { type: 'body', metatype: UpdatePlanoDeContaDto },
    )) as UpdatePlanoDeContaDto;
    expect(resultado.nome).toBe('Novo nome');
    expect(resultado.contaPaiId).toBeUndefined();
  });

  it.each([null, 0, -1, 1.5, '101'])(
    'rejeita contaPaiId inválido na edição: %s',
    async (contaPaiId) => {
      await expect(
        pipe.transform(
          { contaPaiId },
          { type: 'body', metatype: UpdatePlanoDeContaDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );
});
