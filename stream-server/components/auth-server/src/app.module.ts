import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgresConfig from './config/postgres.config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProxyModule } from './proxy/proxy.module';
import authConfig from './config/auth.config';
import proxyConfig from './config/proxy.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig, postgresConfig, proxyConfig],
    }),
    TypeOrmModule.forRootAsync(postgresConfig.asProvider()),
    UsersModule,
    AuthModule,
    ProxyModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
