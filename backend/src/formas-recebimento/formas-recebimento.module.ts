import { Module } from '@nestjs/common';
import { FormasRecebimentoService } from './formas-recebimento.service';
import { FormasRecebimentoController } from './formas-recebimento.controller';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { FormasRecebimento } from './entities/formas-recebimento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [FormasRecebimentoController],
  providers: [FormasRecebimentoService],
  imports: [TypeOrmModule.forFeature([FormasRecebimento, User]), AuthModule],
})
export class FormasRecebimentoModule {}
