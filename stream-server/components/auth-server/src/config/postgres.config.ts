import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'postgres',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.PG_HOST ?? 'localhost',
    port: !isNaN(+process.env.PG_PORT) ? +process.env.PG_PORT : 5432,
    username: process.env.PG_USERNAME ?? 'admin',
    password: process.env.PG_PASSWORD ?? 'password',
    database: process.env.PG_DATABASE ?? 'auth',
    autoLoadEntities: true,
    // Entities schemas should never change.
    synchronize: true,
  }),
);
