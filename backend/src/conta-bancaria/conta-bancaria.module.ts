import { Module } from '@nestjs/common';
import { ContaBancariaService } from './conta-bancaria.service';
import { ContaBancariaController } from './conta-bancaria.controller';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { ContaBancaria } from './entities/conta-bancaria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ContaBancariaController],
  providers: [ContaBancariaService],
  imports: [TypeOrmModule.forFeature([ContaBancaria, User]), AuthModule],
})
export class ContaBancariaModule {}
