import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from './variant.schema';
import { Model } from 'mongoose';
import { VariantType } from './variant.type';

@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
  ) {}

  async validateVariant(id: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id);
    if (!variant) {
      throw new NotFoundException(`This variant id: ${id} not exists.`);
    }
    return variant;
  }

  async createVariant(variant: VariantType): Promise<Variant> {
    const { size, color, inventory, productId } = variant;
    const newVariant = new this.variantModel({
      size,
      color,
      inventory,
      productId,
    });
    return newVariant.save();
  }
}
