import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
