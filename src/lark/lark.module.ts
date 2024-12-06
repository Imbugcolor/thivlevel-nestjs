import { Module } from '@nestjs/common';
import { LarkService } from './lark.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [LarkService],
  exports: [LarkService],
})
export class LarkModule {}
