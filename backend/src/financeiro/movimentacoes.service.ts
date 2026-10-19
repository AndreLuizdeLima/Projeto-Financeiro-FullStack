import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import Big from 'big.js';

import { Movimento } from './entities/movimento.entity';
import { OrigemMovimento, TipoMovimento } from './financeiro.enums';

import { CreateMovimentoDto } from './dto/create-movimento.dto';
import { FiltroFinanceiroDto } from './dto/filtro-financeiro.dto';

import { dinheiro, hoje } from './financeiro.utils';

import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';

import { FinanceiroValidacoesService } from './financeiro-validacoes.service';

@Injectable()
export class MovimentacoesService {
  constructor(
    private readonly db: DataSource,
    private readonly validacoes: FinanceiroValidacoesService,
  ) {}

  async inverter(m: EntityManager, mov: Movimento, userId: number) {
    if (
      mov.origem === OrigemMovimento.ESTORNO ||
      (await m.exists(Movimento, { where: { estornoDeId: mov.id } }))
    )
      throw new ConflictException('Movimentação já estornada ou é um estorno.');
    const { id, criadoEm: _criadoEm, ...dados } = mov;
    return m.save(
      Movimento,
      m.create(Movimento, {
        ...dados,
        tipo:
          mov.tipo === TipoMovimento.TRANSFERENCIA
            ? TipoMovimento.TRANSFERENCIA
            : mov.tipo === TipoMovimento.ENTRADA
              ? TipoMovimento.SAIDA
              : TipoMovimento.ENTRADA,
        origem: OrigemMovimento.ESTORNO,
        descricao: `Estorno: ${mov.descricao}`,
        data: hoje(),
        contaOrigemId: mov.contaDestinoId,
        contaDestinoId: mov.contaOrigemId,
        estornoDeId: id,
        criadoPorId: userId,
      }),
    );
  }
  async criarMovimento(dto: CreateMovimentoDto, userId: number) {
    if (dto.data > hoje())
      throw new BadRequestException('Movimentação não pode estar no futuro.');
    if (new Big(dto.valor).lte(0))
      throw new BadRequestException('Valor deve ser positivo.');
    const origem = dto.contaOrigemId ?? null,
      destino = dto.contaDestinoId ?? null;
    if (
      (dto.tipo === TipoMovimento.ENTRADA &&
        (origem !== null || destino === null)) ||
      (dto.tipo === TipoMovimento.SAIDA &&
        (origem === null || destino !== null)) ||
      (dto.tipo === TipoMovimento.TRANSFERENCIA &&
        (origem === null || destino === null || origem === destino))
    )
      throw new BadRequestException(
        'Contas de origem/destino incompatíveis com o tipo.',
      );
    if (
      dto.origem === OrigemMovimento.SALDO_INICIAL &&
      dto.tipo === TipoMovimento.TRANSFERENCIA
    )
      throw new BadRequestException('Saldo inicial não é transferência.');
    return this.db.transaction(async (m) => {
      await this.validacoes.referencias(m, dto);
      for (const id of [
        ...new Set([origem, destino].filter((v): v is number => v !== null)),
      ].sort((a, b) => a - b))
        await this.validacoes.referencia(
          m,
          ContaBancaria,
          id,
          'Conta financeira',
        );
      return m.save(
        Movimento,
        m.create(Movimento, {
          ...dto,
          origem: dto.origem ?? OrigemMovimento.AVULSA,
          valor: dinheiro(dto.valor),
          contaOrigemId: origem,
          contaDestinoId: destino,
          criadoPorId: userId,
        }),
      );
    });
  }
  async estornarMovimento(id: number, userId: number) {
    return this.db.transaction(async (m) => {
      const mov = await m.findOne(Movimento, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!mov) throw new NotFoundException('Movimentação não encontrada.');
      if (mov.liquidacaoId !== null)
        throw new ConflictException('Estorne pela conta vinculada.');
      return this.inverter(m, mov, userId);
    });
  }
  private filtroMovimentos(dto: FiltroFinanceiroDto) {
    this.validacoes.periodo(dto);
    const q = this.db
      .getRepository(Movimento)
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.liquidacao', 'l')
      .leftJoinAndSelect('l.conta', 'c');
    for (const key of ['tipo', 'origem'] as const)
      if (dto[key]) q.andWhere(`m.${key} = :${key}`, { [key]: dto[key] });
    for (const key of [
      'clienteId',
      'planoDeContaId',
      'centroDeCustoId',
    ] as const)
      if (dto[key])
        q.andWhere(`COALESCE(c.${key},m.${key}) = :${key}`, {
          [key]: dto[key],
        });
    if (dto.contaBancariaId)
      q.andWhere('(m.contaOrigemId = :banco OR m.contaDestinoId = :banco)', {
        banco: dto.contaBancariaId,
      });
    if (dto.dataInicial)
      q.andWhere('m.data >= :inicio', { inicio: dto.dataInicial });
    if (dto.dataFinal) q.andWhere('m.data <= :fim', { fim: dto.dataFinal });
    return q;
  }

  listarMovimentos(dto: FiltroFinanceiroDto) {
    return this.validacoes.paginar(this.filtroMovimentos(dto), dto);
  }

  async obterMovimento(id: number) {
    const mov = await this.db.getRepository(Movimento).findOne({
      where: { id },
      relations: { liquidacao: { conta: true }, estornoDe: true },
    });
    if (!mov) throw new NotFoundException('Movimentação não encontrada.');
    return mov;
  }
  async resumoMovimentos(dto: FiltroFinanceiroDto) {
    const q = this.filtroMovimentos(dto);
    return q
      .select('m.tipo', 'tipo')
      .addSelect('m.origem', 'origem')
      .addSelect('COUNT(*)::int', 'quantidade')
      .addSelect('SUM(m.valor)::text', 'valorTotal')
      .groupBy('m.tipo')
      .addGroupBy('m.origem')
      .getRawMany();
  }
}
