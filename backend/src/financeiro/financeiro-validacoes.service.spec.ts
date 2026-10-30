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
  FinanceiroValidacoesService,
  ContaBancaria,
  PlanoDeConta,
  criarBancoSimulado,
  criarConta,
  fixarHoje,
} from './testing/financeiro-test.helper';
import { NaturezaConta } from '@/plano-de-contas/dto/natureza-da-conta';
import { SituacaoConta } from './financeiro.enums';

describe('FinanceiroValidacoesService — regras compartilhadas', () => {
  beforeEach(fixarHoje);
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  const service = new FinanceiroValidacoesService();
  it.each([null, undefined])('ignora referência opcional %s', async (id) => {
    const { entityManager, manager } = criarBancoSimulado();
    await service.referencia(entityManager, ContaBancaria, id, 'Banco');
    expect(manager.getRepository).not.toHaveBeenCalled();
  });
  it.each([null, { id: 5, isActive: false }])(
    'rejeita referência inexistente ou inativa: %j',
    async (registro) => {
      const { entityManager, repository } = criarBancoSimulado();
      repository.findOne.mockResolvedValue(registro);
      await expect(
        service.referencia(entityManager, ContaBancaria, 5, 'Banco'),
      ).rejects.toThrow(BadRequestException);
    },
  );
  it('aceita referência ativa', async () => {
    const { entityManager, repository } = criarBancoSimulado();
    repository.findOne.mockResolvedValue({ id: 5, isActive: true });
    await expect(
      service.referencia(entityManager, ContaBancaria, 5, 'Banco'),
    ).resolves.toBeUndefined();
  });
  it.each([
    [NaturezaConta.SINTETICA, false],
    [NaturezaConta.ANALITICA, true],
  ] as const)('plano %s tem aceitação %s', async (natureza, aceito) => {
    const { entityManager, repository } = criarBancoSimulado();
    repository.findOne.mockResolvedValue({ id: 3, isActive: true, natureza });
    const resultado = service.referencia(
      entityManager,
      PlanoDeConta,
      3,
      'Plano',
    );
    if (aceito) await expect(resultado).resolves.toBeUndefined();
    else
      await expect(resultado).rejects.toThrow(
        'Plano de contas deve ser analítico.',
      );
  });
  it('valida todas as referências presentes no lançamento', async () => {
    const { entityManager, repository } = criarBancoSimulado();
    repository.findOne.mockResolvedValue({
      isActive: true,
      natureza: NaturezaConta.ANALITICA,
    });
    await service.referencias(entityManager, {
      clienteId: 2,
      planoDeContaId: 3,
      centroDeCustoId: 4,
      formaRecebimentoId: 6,
    });
    expect(repository.findOne.mock.calls.map(([options]) => options)).toEqual(
      [2, 3, 4, 6].map((id) => ({
        where: { id },
        lock: { mode: 'pessimistic_read' },
      })),
    );
  });
  it('sinaliza conta inexistente', async () => {
    const { entityManager, manager } = criarBancoSimulado();
    manager.findOne.mockResolvedValue(null);
    await expect(service.conta(entityManager, 99)).rejects.toThrow(
      NotFoundException,
    );
  });
  it.each([SituacaoConta.LIQUIDADA, SituacaoConta.CANCELADA])(
    'bloqueia alteração em conta %s',
    (situacao) => {
      expect(() => service.aberta(criarConta({ situacao }))).toThrow(
        ConflictException,
      );
    },
  );
  it('permite operação em conta aberta', () => {
    expect(() => service.aberta(criarConta())).not.toThrow();
  });
  it.each([
    [SituacaoConta.ABERTA, '2026-10-19', true],
    [SituacaoConta.ABERTA, '2026-10-20', false],
    [SituacaoConta.ABERTA, '2026-10-21', false],
    [SituacaoConta.LIQUIDADA, '2026-10-19', false],
    [SituacaoConta.CANCELADA, '2026-10-19', false],
  ] as const)(
    'apresenta %s vencendo em %s com vencida=%s',
    (situacao, dataVencimento, vencida) => {
      expect(
        service.apresentar(criarConta({ situacao, dataVencimento })).vencida,
      ).toBe(vencida);
    },
  );
  it('rejeita período invertido', () => {
    expect(() =>
      service.periodo({
        page: 1,
        limit: 10,
        dataInicial: '2026-10-20',
        dataFinal: '2026-10-19',
      }),
    ).toThrow(BadRequestException);
  });
});
