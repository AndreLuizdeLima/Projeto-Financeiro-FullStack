import { Module } from '@nestjs/common';
import { PlanoDeContasService } from './plano-de-contas.service';
import { PlanoDeContasController } from './plano-de-contas.controller';
import { User } from '@/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanoDeConta } from './entities/plano-de-conta.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [PlanoDeContasController],
  providers: [PlanoDeContasService],
  imports: [TypeOrmModule.forFeature([PlanoDeConta, User]), AuthModule],
})
export class PlanoDeContasModule {}
