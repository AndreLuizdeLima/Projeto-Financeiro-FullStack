import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { Conta } from './entities/conta.entity';

import { SituacaoConta } from './financeiro.enums';

import { FiltroFinanceiroDto } from './dto/filtro-financeiro.dto';

import { hoje } from './financeiro.utils';
import { Cliente } from '@/cliente/entities/cliente.entity';

import { PlanoDeConta } from '@/plano-de-contas/entities/plano-de-conta.entity';
import { CentroDeCusto } from '@/centro-de-custo/entities/centro-de-custo.entity';
import { FormasRecebimento } from '@/formas-recebimento/entities/formas-recebimento.entity';
import { NaturezaConta } from '@/plano-de-contas/dto/natureza-da-conta';

@Injectable()
export class FinanceiroValidacoesService {
  async referencia(
    m: EntityManager,
    entity: EntityTarget<ObjectLiteral>,
    id: number | null | undefined,
    nome: string,
  ) {
    if (id == null) return;
    const value = await m
      .getRepository(entity)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_read' } });
    if (!value || !value.isActive)
      throw new BadRequestException(`${nome} inexistente ou inativo.`);
    if (entity === PlanoDeConta && value.natureza !== NaturezaConta.ANALITICA)
      throw new BadRequestException('Plano de contas deve ser analítico.');
  }

  async referencias(
    m: EntityManager,
    dto: {
      clienteId?: number | null;
      planoDeContaId?: number | null;
      centroDeCustoId?: number | null;
      formaRecebimentoId?: number | null;
    },
  ) {
    await this.referencia(m, Cliente, dto.clienteId, 'Cliente');
    await this.referencia(
      m,
      PlanoDeConta,
      dto.planoDeContaId,
      'Plano de contas',
    );
    await this.referencia(
      m,
      CentroDeCusto,
      dto.centroDeCustoId,
      'Centro de custo',
    );
    await this.referencia(
      m,
      FormasRecebimento,
      dto.formaRecebimentoId,
      'Forma de recebimento',
    );
  }

  periodo(dto: FiltroFinanceiroDto) {
    if (dto.dataInicial && dto.dataFinal && dto.dataInicial > dto.dataFinal)
      throw new BadRequestException('Período inválido.');
  }

  async conta(m: EntityManager, id: number) {
    const c = await m.findOne(Conta, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!c) throw new NotFoundException('Conta não encontrada.');
    return c;
  }

  aberta(c: Conta) {
    if (c.situacao !== SituacaoConta.ABERTA)
      throw new ConflictException(
        'Conta deve estar aberta; estorne a liquidação antes de alterar.',
      );
  }

  apresentar(c: Conta) {
    return {
      ...c,
      vencida: c.situacao === SituacaoConta.ABERTA && c.dataVencimento < hoje(),
    };
  }

  async paginar<T extends ObjectLiteral>(
    q: SelectQueryBuilder<T>,
    dto: FiltroFinanceiroDto,
  ) {
    const [data, total] = await q
      .orderBy(`${q.alias}.id`, 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit)
      .getManyAndCount();
    return {
      data,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        hasNextPage: dto.page * dto.limit < total,
      },
    };
  }
}
