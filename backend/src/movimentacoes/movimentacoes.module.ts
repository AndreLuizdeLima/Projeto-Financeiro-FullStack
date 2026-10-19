import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { FinanceiroModule } from '@/financeiro/financeiro.module';
import { MovimentacoesController } from './movimentacoes.controller';
@Module({
  imports: [AuthModule, FinanceiroModule],
  controllers: [MovimentacoesController],
})
export class MovimentacoesModule {}
