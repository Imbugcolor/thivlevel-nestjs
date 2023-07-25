import { Module } from '@nestjs/common';
import { VariantService } from './variant.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from './variant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  providers: [VariantService],
  exports: [VariantService],
})
export class VariantModule {}
