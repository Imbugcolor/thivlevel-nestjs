import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/user/user.schema';
import { ProductsService } from 'src/products/products.service';
import { VariantService } from 'src/variant/variant.service';
import { CartService } from 'src/cart/cart.service';
import { OrderMethod } from './enum/order-method.enum';
import { OrderItem } from './type/orderItem.type';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { APIfeatures } from 'src/utils/ApiFeatures';
import { OrdersDataResponse } from './type/ordersDataResponse.type';
import { OrderStatus } from './enum/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productService: ProductsService,
    private variantService: VariantService,
    private cartService: CartService,
    private userService: UserService,
    @InjectStripe() private stripe: Stripe,
    private configService: ConfigService,
  ) {}

  async validateItem(id: string, quantity: number) {
    const variant = await this.variantService.validateVariant(id);

    if (variant.inventory - quantity < 0) {
      throw new BadRequestException(
        `Inventory quantity product variant id: ${variant._id} is not enough.`,
      );
    }
    return;
  }

  async getOrdersByUser(user: User, req: Request): Promise<OrdersDataResponse> {
    const totalFeatures = new APIfeatures(
      this.orderModel.find({ user: user._id.toString() }),
      req.query,
    )
      .filtering()
      .sorting();

    const total = await totalFeatures.query;

    const ordersFeatures = new APIfeatures(
      this.orderModel.find({ user: user._id.toString() }),
      req.query,
    )
      .filtering()
      .sorting()
      .pagination();

    const orders = await ordersFeatures.query;

    return {
      total: total.length,
      data: {
        length: orders.length,
        orders,
      },
    };
  }

  async getUserOrder(id: string, user: User): Promise<Order> {
    const order = await this.orderModel.findOne({
      _id: id,
      user: user._id.toString(),
    });

    if (!order) {
      throw new NotFoundException(`Order ID: ${id} is not found.`);
    }

    return order;
  }

  async createCodOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const { items, name, phone, address } = createOrderDto;
    const { email } = user;

    //Check item valid before place order
    await Promise.all(
      items.map(async (item) => {
        await this.validateItem(item.variantId, item.quantity);
      }),
    );

    const newItems = await Promise.all(
      items.map(async (item) => {
        await this.inventoryCount(item.variantId, item.quantity, false);
        const product = await this.productService.validateProduct(
          item.productId,
        );
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
        return acc + curr.price * curr.quantity;
      }, 0),
      method: OrderMethod.COD,
    });

    this.soldCount(items, 'productId', false);

    return newOrder.save();
  }

  // Create Checkout Session = Stripe to Payment
  async createCheckout(createOrderDto: CreateOrderDto, user: User) {
    const { items, name, phone, address } = createOrderDto;

    //Check item valid before place order
    await Promise.all(
      items.map(async (item) => {
        await this.validateItem(item.variantId, item.quantity);
      }),
    );

    const newItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.productService.validateProduct(
          item.productId,
        );
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

    const customer = await this.stripe.customers.create({
      metadata: {
        name,
        user: user._id.toString(),
        items: JSON.stringify(items),
        phone,
        address: JSON.stringify(address),
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: newItems.map((item) => {
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.productId.title,
              images: [item.productId.images[0].url],
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      customer: customer.id,
      success_url: `${this.configService.get('CLIENT_CART_URL')}?success=true`,
      cancel_url: `${this.configService.get('CLIENT_CART_URL')}?canceled=true`,
    });

    return { url: session.url, status: session.payment_status };
  }

  createWebhook(signature: string, req: Request) {
    let data: any;
    let eventType: string;

    let event: Stripe.Event;

    const endpointSecret = this.configService.get('WEB_HOOK_SECRET');

    try {
      const body = req.body;
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret,
      );
      data = event.data.object;
      eventType = event.type;
      console.log('Webhook verified.');
    } catch (err: any) {
      console.log(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (eventType === 'checkout.session.completed') {
      this.stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          this.createOrderCheckout(customer as Stripe.Customer, data);
        })
        .catch((err: any) => console.log(err.message));
    }
    // Return a res to acknowledge receipt of the event
  }

  async createOrderCheckout(customer: Stripe.Customer, data: any) {
    const user = await this.userService.getUser(customer.metadata.user);
    const { email } = user;

    const items = JSON.parse(customer.metadata.items);
    const address = JSON.parse(customer.metadata.address);

    const newItems = await Promise.all(
      items.map(async (item) => {
        await this.inventoryCount(item.variantId, item.quantity, false);
        const product = await this.productService.validateProduct(
          item.productId,
        );
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
      user: customer.metadata.user,
      name: customer.metadata.name,
      email,
      items: newItems,
      paymentID: data.payment_intent,
      address,
      total: data.amount_total / 100,
      phone: customer.metadata.phone,
      method: OrderMethod.CARD,
      isPaid: true,
    });

    this.soldCount(items, 'productId', false);

    return newOrder.save();
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
    const values = Object.values(OrderStatus);
    if (!values.includes(status as unknown as OrderStatus)) {
      return new BadRequestException(`status value is wrong.`);
    }
    const oldOrder = await this.orderModel.findById(id);

    if (oldOrder.status === status) return oldOrder;

    const newOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (status === OrderStatus.CANCELED) {
      const items = await Promise.all(
        (newOrder.items as any).map(async (item) => {
          await this.inventoryCount(item.variantId._id, item.quantity, true);
          return {
            ...item,
            productId: item.productId._id,
          };
        }),
      );

      this.soldCount(items, 'productId', true);
    }

    return newOrder;
  }

  async cancelOrder(id: string, user: User): Promise<any> {
    const oldOrder = await this.getUserOrder(id, user);

    if (oldOrder.status === OrderStatus.CANCELED) {
      return new BadRequestException(`The order: ${id} is already canceled.`);
    }

    if (
      oldOrder.status === OrderStatus.SHIPPING ||
      oldOrder.status === OrderStatus.DELIVERED ||
      oldOrder.status === OrderStatus.COMPLETED
    ) {
      return new BadRequestException(`The order: ${id} could not canceled.`);
    }

    const newOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { status: OrderStatus.CANCELED },
      { new: true },
    );

    const items = await Promise.all(
      (newOrder.items as any).map(async (item) => {
        await this.inventoryCount(item.variantId._id, item.quantity, true);
        return {
          ...item,
          productId: item.productId._id,
        };
      }),
    );

    this.soldCount(items, 'productId', true);

    return newOrder;
  }

  soldCount(array: OrderItem[], keyId: string, resold: boolean) {
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
      return this.updateNewSold(id, sumQuantity, resold);
    });
  }

  async updateNewSold(id: string, quantity: number, resold: boolean) {
    const product = await this.productService.validateProduct(id);

    const oldSold = product.sold;

    let newSold: number;

    if (resold) {
      newSold = oldSold - quantity;
    } else {
      newSold = oldSold + quantity;
    }

    await this.productService.updateSold(id, newSold);
  }

  async inventoryCount(id: string, quantity: number, resold: boolean) {
    await this.variantService.updateInventory(id, quantity, resold);
  }
}
