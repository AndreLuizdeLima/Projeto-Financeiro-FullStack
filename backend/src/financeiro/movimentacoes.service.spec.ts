import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  MovimentacoesService,
  FinanceiroValidacoesService,
  Movimento,
  criarMovimento,
  criarBancoSimulado,
  fixarHoje,
} from './testing/financeiro-test.helper';
import { OrigemMovimento, TipoMovimento } from './financeiro.enums';

const dto = { descricao: 'Movimento', valor: '100', data: '2026-10-10' };
const setup = () => {
  const banco = criarBancoSimulado();
  const validacoes = new FinanceiroValidacoesService();
  jest.spyOn(validacoes, 'referencias').mockResolvedValue();
  const referencia = jest.spyOn(validacoes, 'referencia').mockResolvedValue();
  return {
    ...banco,
    referencia,
    service: new MovimentacoesService(banco.db, validacoes),
  };
};
describe('MovimentacoesService', () => {
  beforeEach(fixarHoje);
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it.each([
    [TipoMovimento.ENTRADA, undefined, 5],
    [TipoMovimento.SAIDA, 5, undefined],
    [TipoMovimento.TRANSFERENCIA, 5, 6],
  ] as const)(
    'cria %s com os bancos corretos em um único registro',
    async (tipo, contaOrigemId, contaDestinoId) => {
      const { service, manager } = setup();
      expect(
        await service.criarMovimento(
          { ...dto, tipo, contaOrigemId, contaDestinoId },
          7,
        ),
      ).toMatchObject({
        tipo,
        contaOrigemId: contaOrigemId ?? null,
        contaDestinoId: contaDestinoId ?? null,
        valor: '100.00',
        origem: OrigemMovimento.AVULSA,
        criadoPorId: 7,
      });
      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenCalledWith(
        Movimento,
        expect.any(Movimento),
      );
    },
  );
  it.each([
    [TipoMovimento.ENTRADA, undefined, undefined],
    [TipoMovimento.ENTRADA, 5, 6],
    [TipoMovimento.SAIDA, undefined, undefined],
    [TipoMovimento.SAIDA, 5, 6],
    [TipoMovimento.TRANSFERENCIA, 5, undefined],
    [TipoMovimento.TRANSFERENCIA, undefined, 6],
    [TipoMovimento.TRANSFERENCIA, 5, 5],
  ] as const)(
    'rejeita %s com origem %s e destino %s',
    async (tipo, contaOrigemId, contaDestinoId) => {
      const { service, manager } = setup();
      await expect(
        service.criarMovimento(
          { ...dto, tipo, contaOrigemId, contaDestinoId },
          7,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it.each(['0', '-1'])('rejeita valor %s', async (valor) => {
    const { service, manager } = setup();
    await expect(
      service.criarMovimento(
        { ...dto, valor, tipo: TipoMovimento.ENTRADA, contaDestinoId: 5 },
        7,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rejeita data futura', async () => {
    const { service, manager } = setup();
    await expect(
      service.criarMovimento(
        {
          ...dto,
          data: '2026-10-21',
          tipo: TipoMovimento.ENTRADA,
          contaDestinoId: 5,
        },
        7,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('não grava movimento com conta bancária inválida', async () => {
    const { service, referencia, manager } = setup();
    referencia.mockRejectedValue(new BadRequestException());
    await expect(
      service.criarMovimento(
        { ...dto, tipo: TipoMovimento.ENTRADA, contaDestinoId: 5 },
        7,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it.each([
    [TipoMovimento.ENTRADA, undefined, 5],
    [TipoMovimento.SAIDA, 5, undefined],
  ] as const)(
    'permite saldo inicial por %s',
    async (tipo, contaOrigemId, contaDestinoId) => {
      const { service } = setup();
      expect(
        await service.criarMovimento(
          {
            ...dto,
            tipo,
            contaOrigemId,
            contaDestinoId,
            origem: OrigemMovimento.SALDO_INICIAL,
          },
          7,
        ),
      ).toMatchObject({ origem: OrigemMovimento.SALDO_INICIAL });
    },
  );
  it('não permite transferência como saldo inicial', async () => {
    const { service, manager } = setup();
    await expect(
      service.criarMovimento(
        {
          ...dto,
          tipo: TipoMovimento.TRANSFERENCIA,
          contaOrigemId: 5,
          contaDestinoId: 6,
          origem: OrigemMovimento.SALDO_INICIAL,
        },
        7,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it.each([
    [TipoMovimento.ENTRADA, null, 5, TipoMovimento.SAIDA],
    [TipoMovimento.SAIDA, 5, null, TipoMovimento.ENTRADA],
    [TipoMovimento.TRANSFERENCIA, 5, 6, TipoMovimento.TRANSFERENCIA],
  ] as const)(
    'estorna %s sem alterar o original',
    async (tipo, origem, destino, inverso) => {
      const { service, manager } = setup();
      const original = criarMovimento({
        tipo,
        contaOrigemId: origem,
        contaDestinoId: destino,
      });
      const copia = { ...original };
      manager.findOne.mockResolvedValue(original);
      const estorno = await service.estornarMovimento(original.id, 8);
      expect(estorno).toMatchObject({
        tipo: inverso,
        origem: OrigemMovimento.ESTORNO,
        contaOrigemId: destino,
        contaDestinoId: origem,
        valor: original.valor,
        estornoDeId: original.id,
        data: '2026-10-20',
        criadoPorId: 8,
      });
      expect(estorno.id).toBeUndefined();
      expect(estorno.criadoEm).toBeUndefined();
      expect(original).toEqual(copia);
    },
  );
  it.each(['duplicado', 'estorno', 'liquidacao'] as const)(
    'bloqueia estorno: %s',
    async (caso) => {
      const { service, manager } = setup();
      manager.findOne.mockResolvedValue(
        criarMovimento({
          origem:
            caso === 'estorno'
              ? OrigemMovimento.ESTORNO
              : OrigemMovimento.AVULSA,
          liquidacaoId: caso === 'liquidacao' ? 10 : null,
        }),
      );
      manager.exists.mockResolvedValue(caso === 'duplicado');
      await expect(service.estornarMovimento(20, 8)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it('não estorna movimento inexistente', async () => {
    const { service, manager } = setup();
    manager.findOne.mockResolvedValue(null);
    await expect(service.estornarMovimento(99, 8)).rejects.toThrow(
      NotFoundException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
});
