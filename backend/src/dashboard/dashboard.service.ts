import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Big from 'big.js';
import dayjs from 'dayjs';
import { Movimento } from '@/financeiro/entities/movimento.entity';
import { TipoMovimento } from '@/financeiro/financeiro.enums';
import { hoje } from '@/financeiro/financeiro.utils';

export interface EvolucaoSaldoMensal {
  mes: string;
  saldoInicial: number;
  evolucao: {
    semana: number;
    dataInicial: string;
    dataFinal: string;
    saldo: number;
  }[];
}

export interface DashboardMensal {
  receita: number;
  despesas: number;
  saldo: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: DataSource) {}

  private ultimoDia(mes: string): number {
    const [ano, numeroMes] = mes.split('-').map(Number);
    return dayjs('2000-01-01')
      .year(ano)
      .month(numeroMes - 1)
      .daysInMonth();
  }

  async evolucaoSaldo(mes: string): Promise<EvolucaoSaldoMensal> {
    const inicio = `${mes}-01`;
    const fimMes = `${mes}-${this.ultimoDia(mes)}`;
    const dataHoje = hoje();
    const fim = fimMes < dataHoje ? fimMes : dataHoje;
    const semana =
      'CASE WHEN m.data < :inicio THEN 0 ELSE ((EXTRACT(DAY FROM m.data)::int - 1) / 7) + 1 END';
    const valores = await this.db
      .getRepository(Movimento)
      .createQueryBuilder('m')
      .select(semana, 'semana')
      .addSelect(
        'SUM((CASE WHEN m.contaDestinoId IS NOT NULL THEN m.valor ELSE 0 END) - (CASE WHEN m.contaOrigemId IS NOT NULL THEN m.valor ELSE 0 END))::text',
        'valor',
      )
      .where('m.data <= :fim', { fim })
      .setParameters({ inicio })
      .groupBy(semana)
      .getRawMany<{ semana: number; valor: string }>();

    const porSemana = new Map(valores.map((v) => [Number(v.semana), v.valor]));
    let saldo = new Big(porSemana.get(0) ?? 0);
    const resultado: EvolucaoSaldoMensal = {
      mes,
      saldoInicial: saldo.toNumber(),
      evolucao: [],
    };
    if (inicio > dataHoje) return resultado;

    const ultimoDia = Number(fim.slice(-2));
    for (let dia = 1, semana = 1; dia <= ultimoDia; dia += 7, semana++) {
      saldo = saldo.plus(porSemana.get(semana) ?? 0);
      resultado.evolucao.push({
        semana,
        dataInicial: `${mes}-${String(dia).padStart(2, '0')}`,
        dataFinal: `${mes}-${String(Math.min(dia + 6, ultimoDia)).padStart(2, '0')}`,
        saldo: saldo.toNumber(),
      });
    }
    return resultado;
  }

  async cardsDashboards(mes: string): Promise<DashboardMensal> {
    const totais = await this.db
      .getRepository(Movimento)
      .createQueryBuilder('m')
      .select(
        'COALESCE(SUM(CASE WHEN m.tipo = :entrada THEN m.valor ELSE 0 END), 0)::text',
        'receita',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN m.tipo = :saida THEN m.valor ELSE 0 END), 0)::text',
        'despesas',
      )
      .where('m.data >= :inicio AND m.data <= :fim', {
        inicio: `${mes}-01`,
        fim: `${mes}-${this.ultimoDia(mes)}`,
      })
      .setParameters({
        entrada: TipoMovimento.ENTRADA,
        saida: TipoMovimento.SAIDA,
      })
      .getRawOne<{ receita: string; despesas: string }>();

    const receita = new Big(totais?.receita ?? 0);
    const despesas = new Big(totais?.despesas ?? 0);
    return {
      receita: receita.toNumber(),
      despesas: despesas.toNumber(),
      saldo: receita.minus(despesas).toNumber(),
    };
  }
}
