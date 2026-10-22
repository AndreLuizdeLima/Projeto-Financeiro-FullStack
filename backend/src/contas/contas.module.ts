import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { FinanceiroModule } from '@/financeiro/financeiro.module';
import { ContasController } from './contas.controller';
@Module({
  imports: [AuthModule, FinanceiroModule],
  controllers: [ContasController],
})
export class ContasModule {}
