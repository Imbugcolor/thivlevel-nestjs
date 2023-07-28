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

  async updateVariant(variant: VariantType): Promise<Variant> {
    const { _id, size, color, inventory } = variant;
    const newVariant = await this.variantModel.findByIdAndUpdate(_id, {
      size,
      color,
      inventory,
    });
    return newVariant;
  }

  async deleteVariants(ids: any[]): Promise<any> {
    return this.variantModel.deleteMany({ _id: { $in: ids } });
  }

  async getVariantsByQuery(query: any): Promise<any> {
    return this.variantModel.find(query);
  }

  async updateInventory(id: string, inventory: number): Promise<Variant> {
    return this.variantModel.findByIdAndUpdate(id, { inventory });
  }
}
