import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ConfigModule, JwtModule.register({}), RedisModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
