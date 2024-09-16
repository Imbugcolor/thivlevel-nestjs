import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Variant } from './variant.schema';
import { Model } from 'mongoose';
import { VariantDto } from './dto/variant.dto';
import { Item } from 'src/item/item.schema';

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

  async createVariant(variant: VariantDto): Promise<Variant> {
    const { size, color, inventory, productId } = variant;
    const newVariant = new this.variantModel({
      size,
      color,
      inventory,
      productId,
    });
    return newVariant.save();
  }

  async updateVariant(variant: VariantDto): Promise<Variant> {
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

  async updateInventory(items: Item[], resold: boolean) {
    // Step 1: Store the original stock levels to handle rollback if necessary
    const originalStocks: { [key: string]: number } = {};
    try {
      if (!resold) {
        for (const item of items) {
          const { variantId, quantity } = item;
          const variant = await this.variantModel.findById(
            variantId._id.toString(),
          );

          if (variant.inventory < quantity) {
            throw new BadRequestException(`${variant._id} không đủ số lượng.`);
          }

          originalStocks[`${variant._id.toString()}`] = variant.inventory;
        }
      }

      for (const item of items) {
        const { variantId, quantity } = item;
        const variant = await this.variantModel.findById(
          variantId._id.toString(),
        );

        if (!resold) {
          variant.inventory = variant.inventory - quantity;
        } else {
          variant.inventory = variant.inventory + quantity;
        }

        variant.save();
      }

      return { message: 'OK' };
    } catch (error) {
      console.log(error);
      // Step 5: Rollback - Restore the original stock levels for previously updated products
      for (const item of items) {
        const { variantId } = item;

        // If this product was updated, restore its original stock level
        if (originalStocks[variantId._id.toString()] !== undefined) {
          await this.variantModel.findByIdAndUpdate(
            variantId._id.toString(),
            {
              $set: { countInStock: originalStocks[variantId._id.toString()] },
            }, // Restore original stock
          );
        }
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
