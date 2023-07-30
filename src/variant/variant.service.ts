import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Variant } from './variant.schema';
import mongoose, { Model } from 'mongoose';
import { VariantType } from './variant.type';
import { OrderItem } from 'src/order/type/orderItem.type';

@Injectable()
export class VariantService {
  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectConnection() private connection: mongoose.Connection,
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

  async updateInventory(
    id: string,
    quantity: number,
    items: OrderItem[],
    index: number,
  ): Promise<Variant> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const opts = { session, returnOriginal: false };
      const newVariant = await this.variantModel.findByIdAndUpdate(
        id,
        {
          $inc: { inventory: -quantity },
        },
        opts,
      );

      if (newVariant.inventory < 0) {
        // Nếu số lượng tồn kho không đủ, việc đặt hàng không thành công và bị hủy bỏ
        // `session.abortTransaction()` có nhiềm vụ Sẽ hoàn tác thao tác `findOneAndUpdate () 'ở trên

        // Hoàn tác lại các items trước đó
        items.splice(index);
        items.map((item) => {
          this.reUpdateInventory(item.variantId, item.quantity);
        });
        //select lại lần nữa?
        throw new BadRequestException(
          `Sản phẩm ${newVariant.productId} Không đủ số lượng: ` +
            (newVariant.inventory + quantity),
        );
      }

      await session.commitTransaction();
      await session.endSession();
      return newVariant;
    } catch (error) {
      // Nếu xảy ra lỗi, hãy hủy bỏ tất cả các giao dịch và quay trở lại trước khi sửa đổi
      await session.abortTransaction();
      await session.endSession();

      throw new BadRequestException(error); // catch error
    }
  }

  async reUpdateInventory(id: string, quantity: number) {
    return this.variantModel.findByIdAndUpdate(id, {
      $inc: { inventory: quantity },
    });
  }
}
