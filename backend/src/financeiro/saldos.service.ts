import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Big from 'big.js';

import { Movimento } from './entities/movimento.entity';

import { FiltroFinanceiroDto } from './dto/filtro-financeiro.dto';

import { hoje } from './financeiro.utils';

import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';

import { FinanceiroValidacoesService } from './financeiro-validacoes.service';

@Injectable()
export class SaldosService {
  constructor(
    private readonly db: DataSource,
    private readonly validacoes: FinanceiroValidacoesService,
  ) {}

  async saldos(dto: FiltroFinanceiroDto) {
    this.validacoes.periodo(dto);
    const q = this.db.getRepository(ContaBancaria).createQueryBuilder('b');
    if (dto.contaBancariaId)
      q.where('b.id = :banco', { banco: dto.contaBancariaId });
    const contas = await q.orderBy('b.id', 'ASC').getMany();
    const valores = await this.db
      .getRepository(Movimento)
      .createQueryBuilder('m')
      .select('m.contaOrigemId', 'origem')
      .addSelect('m.contaDestinoId', 'destino')
      .addSelect('SUM(m.valor)::text', 'valor')
      .where('m.data <= :fim', { fim: dto.dataFinal ?? hoje() })
      .groupBy('m.contaOrigemId')
      .addGroupBy('m.contaDestinoId')
      .getRawMany<{
        origem: number | null;
        destino: number | null;
        valor: string;
      }>();
    return contas.map((c) => {
      let saldo = new Big(0);
      for (const v of valores) {
        if (v.origem === c.id) saldo = saldo.minus(v.valor);
        if (v.destino === c.id) saldo = saldo.plus(v.valor);
      }
      return { contaBancariaId: c.id, nome: c.nome, saldo: saldo.toFixed(2) };
    });
  }
}
