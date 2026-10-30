import { jest } from '@jest/globals';
import type { DataSource, EntityManager } from 'typeorm';
import type { Conta as ContaType } from '../entities/conta.entity';
import type { Movimento as MovimentoType } from '../entities/movimento.entity';
import {
  OrigemMovimento,
  SituacaoConta,
  TipoConta,
  TipoMovimento,
} from '../financeiro.enums';

jest.unstable_mockModule('@/users/entities/user.entity', () => ({
  User: class {},
}));
export const { Conta } =
  (await import('../entities/conta.entity')) as typeof import('../entities/conta.entity');
export const { Liquidacao } =
  (await import('../entities/liquidacao.entity')) as typeof import('../entities/liquidacao.entity');
export const { Movimento } =
  (await import('../entities/movimento.entity')) as typeof import('../entities/movimento.entity');
export const { ContaBancaria } =
  (await import('@/conta-bancaria/entities/conta-bancaria.entity')) as typeof import('@/conta-bancaria/entities/conta-bancaria.entity');
export const { PlanoDeConta } =
  (await import('@/plano-de-contas/entities/plano-de-conta.entity')) as typeof import('@/plano-de-contas/entities/plano-de-conta.entity');
export const { FinanceiroValidacoesService } =
  (await import('../financeiro-validacoes.service')) as typeof import('../financeiro-validacoes.service');
export const { ContasService } =
  (await import('../contas.service')) as typeof import('../contas.service');
export const { MovimentacoesService } =
  (await import('../movimentacoes.service')) as typeof import('../movimentacoes.service');
export const { LiquidacoesService } =
  (await import('../liquidacoes.service')) as typeof import('../liquidacoes.service');
export const { SaldosService } =
  (await import('../saldos.service')) as typeof import('../saldos.service');

export const criarConta = (dados: Partial<ContaType> = {}): ContaType =>
  Object.assign(
    new Conta(),
    {
      id: 1,
      tipo: TipoConta.PAGAR,
      descricao: 'Material',
      valorOriginal: '1000.00',
      taxaJurosDiaria: '0.1',
      taxaMulta: '2',
      dataEmissao: '2026-10-01',
      dataVencimento: '2026-10-10',
      situacao: SituacaoConta.ABERTA,
      clienteId: 2,
      planoDeContaId: 3,
      centroDeCustoId: null,
      criadoPorId: 7,
    },
    dados,
  );

export const criarMovimento = (
  dados: Partial<MovimentoType> = {},
): MovimentoType =>
  Object.assign(
    new Movimento(),
    {
      id: 20,
      tipo: TipoMovimento.ENTRADA,
      origem: OrigemMovimento.AVULSA,
      descricao: 'Entrada',
      valor: '100.00',
      data: '2026-10-10',
      contaOrigemId: null,
      contaDestinoId: 5,
      liquidacaoId: null,
      estornoDeId: null,
      criadoPorId: 7,
      criadoEm: new Date('2026-10-10T12:00:00Z'),
    },
    dados,
  );

export const criarBancoSimulado = () => {
  const consulta = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOne: jest.fn<() => Promise<object | null>>(),
  };
  const repository = {
    findOne: jest.fn<(...args: unknown[]) => Promise<object | null>>(),
    createQueryBuilder: jest.fn().mockReturnValue(consulta),
  };
  const manager = {
    create: jest.fn((target: new () => object, dados: object) =>
      Object.assign(new target(), dados),
    ),
    save: jest.fn((target: unknown, dados?: unknown) =>
      Promise.resolve(dados ?? target),
    ),
    remove: jest.fn((_entity: unknown) => Promise.resolve(undefined)),
    exists: jest
      .fn<(...args: unknown[]) => Promise<boolean>>()
      .mockResolvedValue(false),
    findOne: jest.fn<(...args: unknown[]) => Promise<object | null>>(),
    findOneByOrFail: jest.fn<(...args: unknown[]) => Promise<object>>(),
    getRepository: jest.fn().mockReturnValue(repository),
  };
  const entityManager = manager as unknown as EntityManager;
  const transaction = jest.fn(
    async (executar: (m: EntityManager) => Promise<unknown>) =>
      executar(entityManager),
  );
  const db = {
    transaction,
    getRepository: manager.getRepository,
  } as unknown as DataSource;
  return { db, manager, entityManager, transaction, repository, consulta };
};

export const fixarHoje = () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    FINANCEIRO_TIMEZONE: 'America/Sao_Paulo',
  });
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-20T15:00:00Z'));
};
