import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conta } from './entities/conta.entity';
import { Liquidacao } from './entities/liquidacao.entity';
import { Movimento } from './entities/movimento.entity';
import { FinanceiroValidacoesService } from './financeiro-validacoes.service';
import { ContasService } from './contas.service';
import { LiquidacoesService } from './liquidacoes.service';
import { MovimentacoesService } from './movimentacoes.service';
import { SaldosService } from './saldos.service';
@Module({
  imports: [TypeOrmModule.forFeature([Conta, Liquidacao, Movimento])],
  providers: [
    FinanceiroValidacoesService,
    ContasService,
    LiquidacoesService,
    MovimentacoesService,
    SaldosService,
  ],
  exports: [
    ContasService,
    LiquidacoesService,
    MovimentacoesService,
    SaldosService,
  ],
})
export class FinanceiroModule {}
