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
  ContasService,
  FinanceiroValidacoesService,
  Conta,
  criarConta,
  criarBancoSimulado,
  fixarHoje,
} from './testing/financeiro-test.helper';
import { SituacaoConta, TipoConta } from './financeiro.enums';

const dto = (tipo: TipoConta) => ({
  tipo,
  descricao: 'Material',
  valorOriginal: '1000',
  dataEmissao: '2026-10-01',
  dataVencimento: '2026-10-10',
  clienteId: 2,
  planoDeContaId: 3,
});
const setup = () => {
  const banco = criarBancoSimulado();
  const validacoes = new FinanceiroValidacoesService();
  const referencias = jest.spyOn(validacoes, 'referencias').mockResolvedValue();
  const service = new ContasService(banco.db, validacoes);
  return { ...banco, referencias, service };
};
describe('ContasService — criação e exclusão', () => {
  beforeEach(fixarHoje);
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it.each(Object.values(TipoConta))(
    'cria conta %s sem movimentar caixa',
    async (tipo) => {
      const { service, manager } = setup();
      expect(await service.criarConta(dto(tipo), 7)).toMatchObject({
        tipo,
        valorOriginal: '1000.00',
        taxaJurosDiaria: '0',
        taxaMulta: '0',
        centroDeCustoId: null,
        criadoPorId: 7,
      });
      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenCalledWith(
        Conta,
        expect.objectContaining({ tipo }),
      );
    },
  );
  it('preserva taxas e centro de custo informados na criação', async () => {
    const { service } = setup();
    expect(
      await service.criarConta(
        {
          ...dto(TipoConta.PAGAR),
          taxaJurosDiaria: '0.1',
          taxaMulta: '2',
          centroDeCustoId: 4,
        },
        7,
      ),
    ).toMatchObject({
      taxaJurosDiaria: '0.1',
      taxaMulta: '2',
      centroDeCustoId: 4,
    });
  });
  it.each(['0', '-1'])(
    'rejeita valor %s antes de persistir',
    async (valorOriginal) => {
      const { service, manager } = setup();
      await expect(
        service.criarConta({ ...dto(TipoConta.PAGAR), valorOriginal }, 7),
      ).rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it('não persiste quando uma referência é inválida', async () => {
    const { service, referencias, manager } = setup();
    referencias.mockRejectedValue(new BadRequestException());
    await expect(service.criarConta(dto(TipoConta.PAGAR), 7)).rejects.toThrow(
      BadRequestException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
  it.each(Object.values(TipoConta))(
    'exclui conta %s aberta sem histórico',
    async (tipo) => {
      const { service, manager } = setup();
      const conta = criarConta({ tipo });
      manager.findOne.mockResolvedValue(conta);
      expect(await service.excluirConta(1)).toEqual({ id: 1, excluida: true });
      expect(manager.remove).toHaveBeenCalledWith(conta);
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it.each([SituacaoConta.LIQUIDADA, SituacaoConta.CANCELADA])(
    'não exclui conta %s',
    async (situacao) => {
      const { service, manager } = setup();
      manager.findOne.mockResolvedValue(criarConta({ situacao }));
      await expect(service.excluirConta(1)).rejects.toThrow(ConflictException);
      expect(manager.remove).not.toHaveBeenCalled();
    },
  );
  it('preserva conta aberta com histórico de liquidação, inclusive estornada', async () => {
    const { service, manager } = setup();
    manager.findOne.mockResolvedValue(criarConta());
    manager.exists.mockResolvedValue(true);
    await expect(service.excluirConta(1)).rejects.toThrow(
      'Conta com histórico deve ser cancelada.',
    );
    expect(manager.remove).not.toHaveBeenCalled();
  });
  it('não exclui conta inexistente', async () => {
    const { service, manager } = setup();
    manager.findOne.mockResolvedValue(null);
    await expect(service.excluirConta(99)).rejects.toThrow(NotFoundException);
    expect(manager.remove).not.toHaveBeenCalled();
  });
});
