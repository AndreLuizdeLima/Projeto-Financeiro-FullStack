import { Module } from '@nestjs/common';
import { CentroDeCustoService } from './centro-de-custo.service';
import { CentroDeCustoController } from './centro-de-custo.controller';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { CentroDeCusto } from './entities/centro-de-custo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CentroDeCustoController],
  providers: [CentroDeCustoService],
  imports: [TypeOrmModule.forFeature([CentroDeCusto, User]), AuthModule],
})
export class CentroDeCustoModule {}
