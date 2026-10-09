import { describe, expect, it } from '@jest/globals';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { UpdatePlanoDeContaDto } from './dto/update-plano-de-conta.dto';
import { NaturezaConta } from './dto/natureza-da-conta';
import { TipoPlanoConta } from './dto/tipo-de-plano.enum';

describe('Validação dos DTOs de plano de contas', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const patchPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
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
    const resultado = (await patchPipe.transform(
      { nome: 'Novo nome' },
      { type: 'body', metatype: UpdatePlanoDeContaDto },
    )) as UpdatePlanoDeContaDto;
    expect(resultado.nome).toBe('Novo nome');
    expect(resultado).not.toHaveProperty('contaPaiId');
    expect(resultado.isActive).toBeUndefined();
  });

  it.each([101, 301, null, 0, -1, 1.5, '101'])(
    'rejeita contaPaiId na edição, mesmo válido: %s',
    async (contaPaiId) => {
      await expect(
        patchPipe.transform(
          { contaPaiId },
          { type: 'body', metatype: UpdatePlanoDeContaDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it.each([
    { codigo: '1.1' },
    { contaPai: { id: 101 } },
    { criadoPor: { id: 7 } },
    { campoDesconhecido: true },
  ])('rejeita campos fora do contrato de edição: %j', async (campos) => {
    await expect(
      patchPipe.transform(
        { nome: 'Novo nome', ...campos },
        { type: 'body', metatype: UpdatePlanoDeContaDto },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it.each([true, false])(
    'aceita PATCH contendo somente isActive: %s',
    async (isActive) => {
      const resultado = (await patchPipe.transform(
        { isActive },
        { type: 'body', metatype: UpdatePlanoDeContaDto },
      )) as UpdatePlanoDeContaDto;
      expect(resultado.isActive).toBe(isActive);
      expect(resultado.nome).toBeUndefined();
      expect(resultado.tipo).toBeUndefined();
      expect(resultado.natureza).toBeUndefined();
    },
  );

  it.each([null, 'false', 'true', 0, 1, {}, []])(
    'rejeita status não booleano na edição: %j',
    async (isActive) => {
      await expect(
        patchPipe.transform(
          { nome: 'Novo nome', isActive },
          { type: 'body', metatype: UpdatePlanoDeContaDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );

  it.each(['nome', 'tipo', 'natureza'])(
    'rejeita null no campo %s da edição',
    async (campo) => {
      await expect(
        patchPipe.transform(
          { [campo]: null },
          { type: 'body', metatype: UpdatePlanoDeContaDto },
        ),
      ).rejects.toThrow(BadRequestException);
    },
  );
});
