import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Cliente } from '@/cliente/entities/cliente.entity';
import { ContaBancaria } from '@/conta-bancaria/entities/conta-bancaria.entity';
import { CentroDeCusto } from '@/centro-de-custo/entities/centro-de-custo.entity';
import { FormasRecebimento } from '@/formas-recebimento/entities/formas-recebimento.entity';
import { PlanoDeConta } from '@/plano-de-contas/entities/plano-de-conta.entity';
import { Conta } from '@/financeiro/entities/conta.entity';
import { Liquidacao } from '@/financeiro/entities/liquidacao.entity';
import { Movimento } from '@/financeiro/entities/movimento.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_DATABASE_HOST ?? 'db',
  port: Number(process.env.DB_DATABASE_PORT ?? 5432),
  username: process.env.DB_DATABASE_USERNAME,
  password: process.env.DB_DATABASE_PASSWORD,
  database: process.env.DB_DATABASE_DATABASE ?? 'financeiro',
  entities: [
    User,
    Cliente,
    ContaBancaria,
    CentroDeCusto,
    FormasRecebimento,
    PlanoDeConta,
    Conta,
    Liquidacao,
    Movimento,
  ],
  migrations: [join(__dirname, 'migrations', '*.js')],
  migrationsTableName: 'implantacao_migrations',
  synchronize: false,
  logging: false,
});
