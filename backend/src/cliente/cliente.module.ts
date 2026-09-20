import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { Cliente } from './entities/cliente.entity';

@Module({
  controllers: [ClienteController],
  imports: [TypeOrmModule.forFeature([Cliente, User]), AuthModule],
  providers: [ClienteService],
})
export class ClienteModule {}
