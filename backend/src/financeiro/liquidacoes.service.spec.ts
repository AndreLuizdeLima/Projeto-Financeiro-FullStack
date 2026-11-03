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
  LiquidacoesService,
  MovimentacoesService,
  FinanceiroValidacoesService,
  Liquidacao,
  Movimento,
  criarConta,
  criarMovimento,
  criarBancoSimulado,
  fixarHoje,
} from './testing/financeiro-test.helper';
import { validate } from 'class-validator';
import { LiquidarContaDto } from './dto/liquidar-conta.dto';
import { PreviaLiquidacaoDto } from './dto/previa-liquidacao.dto';
import {
  OrigemMovimento,
  SituacaoConta,
  TipoConta,
  TipoMovimento,
} from './financeiro.enums';

const pagamento = {
  dataPagamento: '2026-10-13',
  contaBancariaId: 5,
  formaRecebimentoId: 6,
};
const setup = () => {
  const banco = criarBancoSimulado();
  const validacoes = new FinanceiroValidacoesService();
  jest.spyOn(validacoes, 'referencias').mockResolvedValue();
  const referencia = jest.spyOn(validacoes, 'referencia').mockResolvedValue();
  const movimentos = new MovimentacoesService(banco.db, validacoes);
  const service = new LiquidacoesService(banco.db, validacoes, movimentos);
  const conta = criarConta();
  banco.manager.findOne.mockResolvedValue(conta);
  banco.repository.findOne.mockResolvedValue(conta);
  // Simula somente o identificador gerado na persistência, sem recalcular valores.
  banco.manager.save.mockImplementation((target, dados) =>
    Promise.resolve(
      target === Liquidacao
        ? Object.assign(dados as object, { id: 10 })
        : (dados ?? target),
    ),
  );
  return { ...banco, service, conta, referencia };
};
describe('LiquidacoesService', () => {
  beforeEach(fixarHoje);
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it.each([TipoConta.PAGAR, TipoConta.RECEBER])(
    'consulta prévia de %s sem gravar ou movimentar caixa',
    async (tipo) => {
      const { service, conta, manager, transaction } = setup();
      conta.tipo = tipo;
      expect(
        await service.previa(1, { dataPagamento: pagamento.dataPagamento }),
      ).toMatchObject({
        conta: {
          id: 1,
          tipo,
          descricao: 'Material',
          dataEmissao: '2026-10-01',
          dataVencimento: '2026-10-10',
        },
        dataAtual: '2026-10-20',
        dataPagamento: '2026-10-13',
        valorOriginal: '1000.00',
        diasAtraso: 3,
        juros: '3.00',
        multa: '20.00',
        valorTotal: '1023.00',
      });
      expect(manager.save).not.toHaveBeenCalled();
      expect(transaction).not.toHaveBeenCalled();
      expect(conta.situacao).toBe(SituacaoConta.ABERTA);
    },
  );
  it('usa a data financeira atual quando a prévia não informa a data', async () => {
    const { service } = setup();
    expect(await service.previa(1, {})).toMatchObject({
      dataAtual: '2026-10-20',
      dataPagamento: '2026-10-20',
      diasAtraso: 10,
      valorTotal: '1030.00',
    });
  });
  it.each(['2026-10-09', '2026-10-10'])(
    'não aplica encargos na prévia em %s',
    async (dataPagamento) => {
      const { service } = setup();
      expect(await service.previa(1, { dataPagamento })).toMatchObject({
        diasAtraso: 0,
        juros: '0.00',
        multa: '0.00',
        valorTotal: '1000.00',
      });
    },
  );
  it('calcula a prévia com as taxas atuais da conta e arredonda para centavos', async () => {
    const { service, conta } = setup();
    Object.assign(conta, {
      valorOriginal: '0.05',
      taxaJurosDiaria: '10',
      taxaMulta: '10',
    });
    expect(
      await service.previa(1, { dataPagamento: '2026-10-11' }),
    ).toMatchObject({ juros: '0.01', multa: '0.01', valorTotal: '0.07' });
    Object.assign(conta, { taxaJurosDiaria: '0', taxaMulta: '0' });
    expect(
      await service.previa(1, { dataPagamento: '2026-10-11' }),
    ).toMatchObject({ juros: '0.00', multa: '0.00', valorTotal: '0.05' });
  });
  it.each([SituacaoConta.LIQUIDADA, SituacaoConta.CANCELADA])(
    'rejeita prévia de conta %s',
    async (situacao) => {
      const { service, conta } = setup();
      conta.situacao = situacao;
      await expect(service.previa(1, {})).rejects.toThrow(ConflictException);
    },
  );
  it.each(['2026-10-21', '2026-09-30'])(
    'rejeita data %s na prévia',
    async (dataPagamento) => {
      const { service } = setup();
      await expect(service.previa(1, { dataPagamento })).rejects.toThrow(
        BadRequestException,
      );
    },
  );
  it('rejeita prévia de conta inexistente', async () => {
    const { service, repository } = setup();
    repository.findOne.mockResolvedValue(null);
    await expect(service.previa(99, {})).rejects.toThrow(NotFoundException);
  });
  it('liquida quando o total esperado coincide, sem persistir o campo de conferência', async () => {
    const { service } = setup();
    const result = await service.liquidar(
      1,
      { ...pagamento, valorTotalEsperado: '1023' },
      7,
    );
    expect(result.liquidacao.valorTotal).toBe('1023.00');
    expect(result.liquidacao).not.toHaveProperty('valorTotalEsperado');
  });
  it('rejeita total desatualizado antes de qualquer gravação', async () => {
    const { service, conta, manager } = setup();
    const previa = await service.previa(1, {
      dataPagamento: pagamento.dataPagamento,
    });
    conta.taxaMulta = '3';
    await expect(
      service.liquidar(
        1,
        { ...pagamento, valorTotalEsperado: previa.valorTotal },
        7,
      ),
    ).rejects.toThrow(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
    expect(conta.situacao).toBe(SituacaoConta.ABERTA);
  });
  it.each(['-1', '1.001', null, 5])(
    'rejeita total esperado inválido %s no contrato',
    async (valorTotalEsperado) => {
      const erros = await validate(
        Object.assign(new LiquidarContaDto(), pagamento, {
          valorTotalEsperado,
        }),
      );
      expect(erros.some((erro) => erro.property === 'valorTotalEsperado')).toBe(
        true,
      );
    },
  );
  it.each(['2026-02-30', '2026-13-01', 'texto'])(
    'rejeita data inválida %s no contrato da prévia',
    async (dataPagamento) => {
      const erros = await validate(
        Object.assign(new PreviaLiquidacaoDto(), { dataPagamento }),
      );
      expect(erros.some((erro) => erro.property === 'dataPagamento')).toBe(
        true,
      );
    },
  );
  it.each([
    [TipoConta.PAGAR, TipoMovimento.SAIDA, 5, null],
    [TipoConta.RECEBER, TipoMovimento.ENTRADA, null, 5],
  ] as const)(
    'liquida %s com valor e direção corretos',
    async (tipo, direcao, origem, destino) => {
      const { service, conta, manager } = setup();
      conta.tipo = tipo;
      const resultado = await service.liquidar(1, pagamento, 7);
      expect(resultado.conta.situacao).toBe(SituacaoConta.LIQUIDADA);
      expect(resultado.liquidacao).toMatchObject({
        id: 10,
        contaId: 1,
        valorOriginal: '1000.00',
        taxaJurosDiaria: '0.1',
        taxaMulta: '2',
        diasAtraso: 3,
        juros: '3.00',
        multa: '20.00',
        valorTotal: '1023.00',
        criadoPorId: 7,
      });
      expect(resultado.movimento).toMatchObject({
        tipo: direcao,
        origem: OrigemMovimento.LIQUIDACAO,
        valor: '1023.00',
        data: pagamento.dataPagamento,
        contaOrigemId: origem,
        contaDestinoId: destino,
        liquidacaoId: 10,
        criadoPorId: 7,
      });
      expect(
        manager.save.mock.calls.filter(([target]) => target === Movimento),
      ).toHaveLength(1);
      expect(manager.save).toHaveBeenCalledWith(conta);
    },
  );
  it.each([SituacaoConta.LIQUIDADA, SituacaoConta.CANCELADA])(
    'não liquida conta %s',
    async (situacao) => {
      const { service, conta, manager } = setup();
      conta.situacao = situacao;
      await expect(service.liquidar(1, pagamento, 7)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it.each(['2026-10-21', '2026-09-30'])(
    'rejeita pagamento em %s',
    async (dataPagamento) => {
      const { service, manager } = setup();
      await expect(
        service.liquidar(1, { ...pagamento, dataPagamento }, 7),
      ).rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it('não liquida conta inexistente', async () => {
    const { service, manager } = setup();
    manager.findOne.mockResolvedValue(null);
    await expect(service.liquidar(1, pagamento, 7)).rejects.toThrow(
      NotFoundException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('não grava liquidação quando o banco está inativo', async () => {
    const { service, referencia, manager } = setup();
    referencia.mockRejectedValue(new BadRequestException());
    await expect(service.liquidar(1, pagamento, 7)).rejects.toThrow(
      BadRequestException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
  it.each([
    [TipoConta.PAGAR, TipoMovimento.SAIDA, 5, null],
    [TipoConta.RECEBER, TipoMovimento.ENTRADA, null, 5],
  ] as const)(
    'estorna %s preservando histórico e reabrindo a conta',
    async (tipo, direcao, origem, destino) => {
      const { service, conta, manager, consulta } = setup();
      Object.assign(conta, { tipo, situacao: SituacaoConta.LIQUIDADA });
      const liquidacao = Object.assign(new Liquidacao(), {
        id: 10,
        contaId: 1,
        estornadaEm: null,
      });
      consulta.getOne.mockResolvedValue(liquidacao);
      const original = criarMovimento({
        tipo: direcao,
        origem: OrigemMovimento.LIQUIDACAO,
        contaOrigemId: origem,
        contaDestinoId: destino,
        liquidacaoId: 10,
        valor: '1023.00',
      });
      manager.findOneByOrFail.mockResolvedValue(original);
      const resultado = await service.estornarConta(1, 8);
      expect(resultado.conta.situacao).toBe(SituacaoConta.ABERTA);
      expect(resultado.estorno).toMatchObject({
        tipo:
          direcao === TipoMovimento.SAIDA
            ? TipoMovimento.ENTRADA
            : TipoMovimento.SAIDA,
        origem: OrigemMovimento.ESTORNO,
        valor: '1023.00',
        contaOrigemId: destino,
        contaDestinoId: origem,
        estornoDeId: original.id,
        liquidacaoId: 10,
        criadoPorId: 8,
      });
      expect(liquidacao).toMatchObject({
        estornadaEm: new Date('2026-10-20T15:00:00Z'),
        estornadoPorId: 8,
      });
      expect(original.origem).toBe(OrigemMovimento.LIQUIDACAO);
      expect(manager.save).toHaveBeenCalledWith(liquidacao);
      expect(manager.save).toHaveBeenCalledWith(conta);
      expect(manager.remove).not.toHaveBeenCalled();
    },
  );
  it.each([SituacaoConta.ABERTA, SituacaoConta.CANCELADA])(
    'não estorna conta %s',
    async (situacao) => {
      const { service, conta, manager } = setup();
      conta.situacao = situacao;
      await expect(service.estornarConta(1, 7)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    },
  );
  it('não estorna sem liquidação ativa', async () => {
    const { service, conta, consulta, manager } = setup();
    conta.situacao = SituacaoConta.LIQUIDADA;
    consulta.getOne.mockResolvedValue(null);
    await expect(service.estornarConta(1, 7)).rejects.toThrow(
      ConflictException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
});
