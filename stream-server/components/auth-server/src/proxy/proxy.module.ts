import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ProxyController],
  providers: [],
})
export class ProxyModule {}
