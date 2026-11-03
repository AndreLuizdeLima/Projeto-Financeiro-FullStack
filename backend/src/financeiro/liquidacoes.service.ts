import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Liquidacao } from './entities/liquidacao.entity';
import { Movimento } from './entities/movimento.entity';
import {
  OrigemMovimento,
  SituacaoConta,
  TipoConta,
  TipoMovimento,
} from './financeiro.enums';

import { LiquidarContaDto } from './dto/liquidar-conta.dto';

import { calcularLiquidacao, dinheiro, hoje } from './financeiro.utils';
import { Conta } from './entities/conta.entity';
import { PreviaLiquidacaoDto } from './dto/previa-liquidacao.dto';

import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';

import { FinanceiroValidacoesService } from './financeiro-validacoes.service';
import { MovimentacoesService } from './movimentacoes.service';

@Injectable()
export class LiquidacoesService {
  constructor(
    private readonly db: DataSource,
    private readonly validacoes: FinanceiroValidacoesService,
    private readonly movimentacoes: MovimentacoesService,
  ) {}

  private validarData(conta: Conta, pagamento: string, dataAtual: string) {
    this.validacoes.aberta(conta);
    if (pagamento > dataAtual)
      throw new BadRequestException('Pagamento não pode estar no futuro.');
    if (pagamento < conta.dataEmissao)
      throw new BadRequestException('Pagamento anterior à emissão.');
  }

  async previa(id: number, dto: PreviaLiquidacaoDto) {
    const conta = await this.db.getRepository(Conta).findOne({
      where: { id },
      relations: { cliente: true },
    });
    if (!conta) throw new NotFoundException('Conta não encontrada.');
    const dataAtual = hoje();
    const dataPagamento = dto.dataPagamento ?? dataAtual;
    this.validarData(conta, dataPagamento, dataAtual);
    return {
      conta: {
        id: conta.id,
        tipo: conta.tipo,
        descricao: conta.descricao,
        clienteNome: conta.cliente?.razaoSocial ?? '—',
        dataEmissao: conta.dataEmissao,
        dataVencimento: conta.dataVencimento,
      },
      dataAtual,
      dataPagamento,
      valorOriginal: conta.valorOriginal,
      taxaJurosDiaria: conta.taxaJurosDiaria,
      taxaMulta: conta.taxaMulta,
      ...calcularLiquidacao(
        conta.valorOriginal,
        conta.dataVencimento,
        dataPagamento,
        conta.taxaJurosDiaria,
        conta.taxaMulta,
      ),
    };
  }

  async liquidar(id: number, dto: LiquidarContaDto, userId: number) {
    if (dto.dataPagamento > hoje())
      throw new BadRequestException('Pagamento não pode estar no futuro.');
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      this.validarData(c, dto.dataPagamento, hoje());
      await this.validacoes.referencias(m, dto);
      await this.validacoes.referencia(
        m,
        ContaBancaria,
        dto.contaBancariaId,
        'Conta financeira',
      );
      const valores = calcularLiquidacao(
        c.valorOriginal,
        c.dataVencimento,
        dto.dataPagamento,
        c.taxaJurosDiaria,
        c.taxaMulta,
      );
      if (
        dto.valorTotalEsperado !== undefined &&
        dinheiro(dto.valorTotalEsperado) !== valores.valorTotal
      )
        throw new ConflictException(
          'O total da liquidação mudou. Revise os valores atualizados e confirme novamente.',
        );
      const l = await m.save(
        Liquidacao,
        m.create(Liquidacao, {
          dataPagamento: dto.dataPagamento,
          contaBancariaId: dto.contaBancariaId,
          formaRecebimentoId: dto.formaRecebimentoId,
          ...valores,
          contaId: id,
          valorOriginal: c.valorOriginal,
          taxaJurosDiaria: c.taxaJurosDiaria,
          taxaMulta: c.taxaMulta,
          criadoPorId: userId,
        }),
      );
      const pagar = c.tipo === TipoConta.PAGAR;
      const movimento = await m.save(
        Movimento,
        m.create(Movimento, {
          tipo: pagar ? TipoMovimento.SAIDA : TipoMovimento.ENTRADA,
          origem: OrigemMovimento.LIQUIDACAO,
          descricao: c.descricao,
          valor: l.valorTotal,
          data: l.dataPagamento,
          contaOrigemId: pagar ? dto.contaBancariaId : null,
          contaDestinoId: pagar ? null : dto.contaBancariaId,
          liquidacaoId: l.id,
          criadoPorId: userId,
        }),
      );
      c.situacao = SituacaoConta.LIQUIDADA;
      await m.save(c);
      return { conta: this.validacoes.apresentar(c), liquidacao: l, movimento };
    });
  }

  async estornarConta(id: number, userId: number) {
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      if (c.situacao !== SituacaoConta.LIQUIDADA)
        throw new ConflictException('Conta não está liquidada.');
      const l = await m
        .getRepository(Liquidacao)
        .createQueryBuilder('l')
        .where('l.contaId = :id', { id })
        .andWhere('l.estornadaEm IS NULL')
        .setLock('pessimistic_write')
        .getOne();
      if (!l) throw new ConflictException('Liquidação ativa não encontrada.');
      const mov = await m.findOneByOrFail(Movimento, {
        liquidacaoId: l.id,
        origem: OrigemMovimento.LIQUIDACAO,
      });
      const estorno = await this.movimentacoes.inverter(m, mov, userId);
      l.estornadaEm = new Date();
      l.estornadoPorId = userId;
      await m.save(l);
      c.situacao = SituacaoConta.ABERTA;
      await m.save(c);
      return { conta: this.validacoes.apresentar(c), estorno };
    });
  }
}
