import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  SaldosService,
  FinanceiroValidacoesService,
  ContaBancaria,
  Movimento,
  criarBancoSimulado,
  fixarHoje,
} from './testing/financeiro-test.helper';

type Parcela = { origem: number | null; destino: number | null; valor: string };
const setup = (valores: Parcela[]) => {
  const { db, manager } = criarBancoSimulado();
  const bancos = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(() =>
      Promise.resolve([
        { id: 5, nome: 'Caixa' },
        { id: 6, nome: 'Banco' },
      ]),
    ),
  };
  const movimentos = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(() => Promise.resolve(valores)),
  };
  manager.getRepository.mockImplementation((entity: unknown) => {
    if (entity === ContaBancaria) return { createQueryBuilder: () => bancos };
    if (entity === Movimento) return { createQueryBuilder: () => movimentos };
    throw new Error('Entidade inesperada no teste de saldo');
  });
  return {
    service: new SaldosService(db, new FinanceiroValidacoesService()),
    bancos,
    movimentos,
  };
};
describe('SaldosService — cálculo com totais retornados pelo banco', () => {
  beforeEach(fixarHoje);
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  const filtro = { page: 1, limit: 10 };
  it('retorna zero quando não há movimentações', async () => {
    const { service } = setup([]);
    expect(await service.saldos(filtro)).toEqual([
      { contaBancariaId: 5, nome: 'Caixa', saldo: '0.00' },
      { contaBancariaId: 6, nome: 'Banco', saldo: '0.00' },
    ]);
  });
  it('soma entradas e desconta saídas com precisão decimal', async () => {
    const { service } = setup([
      { origem: null, destino: 5, valor: '0.30' },
      { origem: 5, destino: null, valor: '0.10' },
    ]);
    expect((await service.saldos(filtro))[0].saldo).toBe('0.20');
  });
  it('transfere entre bancos preservando o total geral', async () => {
    const { service } = setup([
      { origem: null, destino: 5, valor: '1000.00' },
      { origem: 5, destino: 6, valor: '300.00' },
    ]);
    expect((await service.saldos(filtro)).map((b) => b.saldo)).toEqual([
      '700.00',
      '300.00',
    ]);
  });
  it.each([
    [
      { origem: null, destino: 5, valor: '100.00' },
      { origem: 5, destino: null, valor: '100.00' },
    ],
    [
      { origem: 5, destino: 6, valor: '100.00' },
      { origem: 6, destino: 5, valor: '100.00' },
    ],
  ])('neutraliza movimento e estorno: %j', async (original, estorno) => {
    const { service } = setup([original, estorno]);
    expect((await service.saldos(filtro)).map((b) => b.saldo)).toEqual([
      '0.00',
      '0.00',
    ]);
  });
  it('permite saldo negativo', async () => {
    const { service } = setup([{ origem: 5, destino: null, valor: '100.00' }]);
    expect((await service.saldos(filtro))[0].saldo).toBe('-100.00');
  });
  it('consulta saldo acumulado até hoje por padrão', async () => {
    const { service, movimentos } = setup([]);
    await service.saldos(filtro);
    expect(movimentos.where).toHaveBeenCalledWith('m.data <= :fim', {
      fim: '2026-10-20',
    });
  });
  it('solicita o banco e a data de corte sem limitar o acumulado pela data inicial', async () => {
    const { service, bancos, movimentos } = setup([]);
    await service.saldos({
      ...filtro,
      contaBancariaId: 5,
      dataInicial: '2026-10-01',
      dataFinal: '2026-10-15',
    });
    expect(bancos.where).toHaveBeenCalledWith('b.id = :banco', { banco: 5 });
    expect(movimentos.where.mock.calls).toEqual([
      ['m.data <= :fim', { fim: '2026-10-15' }],
    ]);
  });
});
