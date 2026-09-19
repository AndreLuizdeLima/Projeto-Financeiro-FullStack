import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DB_DATABASE_PORT ?? 5432),
  username: process.env.DB_DATABASE_USERNAME ?? 'postgres',
  password: process.env.DB_DATABASE_PASSWORD ?? '',
  database: process.env.DB_DATABASE_DATABASE ?? 'financeiro',
  autoLoadEntities: process.env.DB_DATABASE_AUTO_LOAD_ENTITIES === 'true',
  synchronize: process.env.DB_DATABASE_SYNCHRONIZE === 'true',
}));
