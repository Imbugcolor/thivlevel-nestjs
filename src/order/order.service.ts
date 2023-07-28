import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { CreateCodOrderDto } from './dto/create-cod-order.dto';
import { User } from 'src/user/user.schema';
import { ProductsService } from 'src/products/products.service';
import { VariantService } from 'src/variant/variant.service';
import { CartService } from 'src/cart/cart.service';
import { OrderMethod } from './enum/order-method.enum';
import { OrderItem } from './type/orderItem.type';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productService: ProductsService,
    private variantService: VariantService,
    private cartService: CartService,
  ) {}

  async createCodOrder(
    createCodOrderDto: CreateCodOrderDto,
    user: User,
  ): Promise<Order> {
    const { items, name, phone, address } = createCodOrderDto;
    const { email } = user;

    const newItems = await Promise.all(
      items.map(async (item) => {
        await this.inventoryCount(item.variantId, item.quantity);
        const product = await this.productService.getProduct(item.productId);
        const variant = await this.variantService.validateVariant(
          item.variantId,
        );

        const { images, product_id, title, price } = product;
        const { inventory, size, color, productId } = variant;

        return {
          ...item,
          productId: { _id: item.productId, images, product_id, title, price },
          variantId: { _id: item.variantId, inventory, size, color, productId },
        };
      }),
    );

    const newOrder = new this.orderModel({
      user,
      name,
      email,
      phone,
      address,
      items: newItems,
      total: items.reduce((acc, curr) => {
        return acc + curr.total;
      }, 0),
      method: OrderMethod.COD,
    });

    this.soldCount(items, 'productId');

    return newOrder.save();
  }

  soldCount(array: OrderItem[], keyId: string) {
    const groupBy = function (xs: any[], id: string) {
      return xs.reduce(function (rv: any, x: any) {
        (rv[x[id]] = rv[x[id]] || []).push(x);
        return rv;
      }, {});
    };

    // Group by _id of items to calculate total sold each product in order items
    const groupById = groupBy(array, keyId);

    Object.keys(groupById).forEach((id) => {
      const sumQuantity = groupById[id].reduce((acc: number, curr: any) => {
        return acc + curr.quantity;
      }, 0);
      return this.updateNewSold(id, sumQuantity);
    });
  }

  async updateNewSold(id: string, quantity: number) {
    const product = await this.productService.getProduct(id);

    const oldSold = product.sold;

    const newSold = oldSold + quantity;
    await this.productService.updateSold(id, newSold);
  }

  async inventoryCount(id: string, quantity: number) {
    const variant = await this.variantService.validateVariant(id);

    const inStock = variant.inventory;
    const inventory = inStock - quantity;

    await this.variantService.updateInventory(id, inventory);
  }
}
