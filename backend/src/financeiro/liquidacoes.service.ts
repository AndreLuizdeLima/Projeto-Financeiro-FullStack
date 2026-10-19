import {
  BadRequestException,
  ConflictException,
  Injectable,
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

import { calcularLiquidacao, hoje } from './financeiro.utils';

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

  async liquidar(id: number, dto: LiquidarContaDto, userId: number) {
    if (dto.dataPagamento > hoje())
      throw new BadRequestException('Pagamento não pode estar no futuro.');
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      this.validacoes.aberta(c);
      if (dto.dataPagamento < c.dataEmissao)
        throw new BadRequestException('Pagamento anterior à emissão.');
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
      const l = await m.save(
        Liquidacao,
        m.create(Liquidacao, {
          ...dto,
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
