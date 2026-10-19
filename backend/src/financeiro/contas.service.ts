import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import Big from 'big.js';
import { Conta } from './entities/conta.entity';
import { Liquidacao } from './entities/liquidacao.entity';

import { SituacaoConta } from './financeiro.enums';
import { CreateContaDto } from './dto/create-conta.dto';

import { FiltroFinanceiroDto } from './dto/filtro-financeiro.dto';

import { UpdateContaDto } from './dto/update-conta.dto';
import { dinheiro, hoje } from './financeiro.utils';

import { FinanceiroValidacoesService } from './financeiro-validacoes.service';

@Injectable()
export class ContasService {
  constructor(
    private readonly db: DataSource,
    private readonly validacoes: FinanceiroValidacoesService,
  ) {}

  async criarConta(dto: CreateContaDto, userId: number) {
    if (new Big(dto.valorOriginal).lte(0))
      throw new BadRequestException('Valor deve ser positivo.');
    return this.db.transaction(async (m) => {
      await this.validacoes.referencias(m, dto);
      return this.validacoes.apresentar(
        await m.save(
          Conta,
          m.create(Conta, {
            ...dto,
            valorOriginal: dinheiro(dto.valorOriginal),
            taxaJurosDiaria: dto.taxaJurosDiaria ?? '0',
            taxaMulta: dto.taxaMulta ?? '0',
            centroDeCustoId: dto.centroDeCustoId ?? null,
            criadoPorId: userId,
          }),
        ),
      );
    });
  }

  async editarConta(id: number, dto: UpdateContaDto) {
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      this.validacoes.aberta(c);
      if (
        Object.values(dto).some((v) => v === null) &&
        Object.entries(dto).some(
          ([k, v]) => v === null && k !== 'centroDeCustoId',
        )
      )
        throw new BadRequestException('Campo obrigatório não pode ser nulo.');
      await this.validacoes.referencias(m, dto);
      if (dto.valorOriginal !== undefined) {
        if (new Big(dto.valorOriginal).lte(0))
          throw new BadRequestException('Valor deve ser positivo.');
        dto.valorOriginal = dinheiro(dto.valorOriginal);
      }
      return this.validacoes.apresentar(
        await m.save(Conta, Object.assign(c, dto)),
      );
    });
  }

  async obterConta(id: number) {
    const c = await this.db.getRepository(Conta).findOne({
      where: { id },
      relations: { cliente: true, planoDeConta: true, centroDeCusto: true },
    });
    if (!c) throw new NotFoundException('Conta não encontrada.');
    return {
      ...this.validacoes.apresentar(c),
      liquidacoes: await this.db
        .getRepository(Liquidacao)
        .find({ where: { contaId: id }, order: { id: 'DESC' } }),
    };
  }

  private filtroContas(dto: FiltroFinanceiroDto) {
    this.validacoes.periodo(dto);
    const q = this.db.getRepository(Conta).createQueryBuilder('c');
    for (const key of [
      'clienteId',
      'planoDeContaId',
      'centroDeCustoId',
      'situacao',
    ] as const)
      if (dto[key] !== undefined)
        q.andWhere(`c.${key} = :${key}`, { [key]: dto[key] });
    if (dto.tipoConta) q.andWhere('c.tipo = :tipo', { tipo: dto.tipoConta });
    if (dto.dataInicial)
      q.andWhere('c.dataVencimento >= :inicio', { inicio: dto.dataInicial });
    if (dto.dataFinal)
      q.andWhere('c.dataVencimento <= :fim', { fim: dto.dataFinal });
    if (dto.vencida !== undefined)
      q.andWhere(
        dto.vencida === 'true'
          ? '(c.situacao = :aberta AND c.dataVencimento < :hoje)'
          : '(c.situacao <> :aberta OR c.dataVencimento >= :hoje)',
        { aberta: SituacaoConta.ABERTA, hoje: hoje() },
      );
    return q;
  }

  async listarContas(dto: FiltroFinanceiroDto) {
    const r = await this.validacoes.paginar(this.filtroContas(dto), dto);
    return { ...r, data: r.data.map((c) => this.validacoes.apresentar(c)) };
  }

  async resumoContas(dto: FiltroFinanceiroDto) {
    const q = this.filtroContas(dto);
    return q
      .select('c.tipo', 'tipo')
      .addSelect('c.situacao', 'situacao')
      .addSelect('COUNT(*)::int', 'quantidade')
      .addSelect('SUM(c.valorOriginal)::text', 'valorTotal')
      .addSelect(
        `COALESCE(SUM(CASE WHEN c.situacao = :aberta AND c.dataVencimento < :hoje THEN c.valorOriginal ELSE 0 END),0)::text`,
        'valorVencido',
      )
      .setParameters({ aberta: SituacaoConta.ABERTA, hoje: hoje() })
      .groupBy('c.tipo')
      .addGroupBy('c.situacao')
      .getRawMany();
  }

  async cancelarConta(id: number) {
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      this.validacoes.aberta(c);
      c.situacao = SituacaoConta.CANCELADA;
      return m.save(c);
    });
  }

  async excluirConta(id: number) {
    return this.db.transaction(async (m) => {
      const c = await this.validacoes.conta(m, id);
      this.validacoes.aberta(c);
      if (await m.exists(Liquidacao, { where: { contaId: id } }))
        throw new ConflictException('Conta com histórico deve ser cancelada.');
      await m.remove(c);
      return { id, excluida: true };
    });
  }
}
