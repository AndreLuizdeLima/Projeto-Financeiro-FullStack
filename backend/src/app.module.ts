import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClienteModule } from './cliente/cliente.module';
import { FormasRecebimentoModule } from './formas-recebimento/formas-recebimento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (
        config: ConfigType<typeof databaseConfig>,
      ): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        autoLoadEntities: config.autoLoadEntities,
        synchronize: config.synchronize,
      }),
    }),
    UsersModule,
    AuthModule,
    ClienteModule,
    FormasRecebimentoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
