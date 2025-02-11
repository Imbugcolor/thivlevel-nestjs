import {
  BadGatewayException,
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './order.schema';
import { Model, Types } from 'mongoose';
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
import { OrderStatus } from './enum/order-status.enum';
import { Item } from 'src/item/item.schema';
import { PaypalService } from 'src/paypal/paypal.service';
import { PaypalTransactionDto } from './dto/paypaltransaction.dto';
import { RedisService } from 'src/redis/redis.service';
import { EventsGateway } from 'src/events/events.gateway';
import { PaginatedResult, Paginator } from 'src/utils/Paginator';
import { OrdersQueryDto } from './dto/orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VnpayService } from 'src/vnpay/vnpay.service';
import { VnpayCheckoutDto } from './dto/vnpay-checkout.dto';
import {
  PaypalTransactionDataType,
  VnpayTransactionDataType,
} from './type/transaction.type';
import { CurrencyService } from 'src/currency/currency.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enum/notificaton.enum';
import { Notification } from 'src/notification/notification.schema';
import { UserNotification } from 'src/notification/userNotification/userNotification.shema';

@Injectable()
export class OrderService {
  private paginator: Paginator<Order>;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productService: ProductsService,
    private variantService: VariantService,
    private cartService: CartService,
    private userService: UserService,
    @InjectStripe() private stripe: Stripe,
    private configService: ConfigService,
    private paypalService: PaypalService,
    private redisService: RedisService,
    private eventsGateway: EventsGateway,
    @Inject(forwardRef(() => VnpayService))
    private vnpayService: VnpayService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService,
  ) {
    this.paginator = new Paginator<Order>(this.orderModel);
  }

  async validateItem(id: string, quantity: number) {
    const variant = await this.variantService.validateVariant(id);

    if (variant.inventory - quantity < 0) {
      throw new BadRequestException(
        `Biến thể: '${variant._id}' không đủ số lượng đặt hàng.`,
      );
    }

    return;
  }

  async getMyOrders(
    user: User,
    ordersQuery: OrdersQueryDto,
  ): Promise<PaginatedResult<Order>> {
    const { limit, page, sort, ...queryString } = ordersQuery;

    const userOrdersQueryString = { ...queryString, user: user._id.toString() };
    return this.paginator.paginate(userOrdersQueryString, {
      limit,
      page,
      sort,
    });
  }

  async getMyOrder(id: string, user: User): Promise<Order> {
    const order = await this.orderModel
      .findOne({
        _id: id,
        user: user._id.toString(),
      })
      .populate([
        {
          path: 'user',
          select: '_id username email avatar phone gender',
        },
      ]);

    if (!order) {
      throw new NotFoundException(`Mã đơn: ${id} không tồn tại.`);
    }

    return order;
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate([
      {
        path: 'user',
        select: '_id username email avatar phone gender',
      },
    ]);

    if (!order) {
      throw new NotFoundException(`Mã đơn: ${id} không tồn tại.`);
    }

    return order;
  }

  async getOrders(query: OrdersQueryDto): Promise<PaginatedResult<Order>> {
    const { limit, page, sort, ...queryString } = query;

    return this.paginator.paginate(queryString, {
      limit,
      page,
      sort,
    });
  }

  async notificationForCreateOrder(order: Order) {
    const order_url = `${this.configService.get('ORDER_ADMIN_ENDPOINT')}/${
      order._id
    }`;
    const notification = await this.notificationService.createAdminNotification(
      {
        title: 'Có đơn hàng mới.',
        message: `Người dùng ${order.email} vừa đặt 1 đơn hàng.`,
        target_url: order_url,
        image_url: order.items[0].productId.images[0].url,
      },
    );
    this.eventsGateway.sendNotification<Notification>({
      adminNotification: true,
      message: notification,
    });
  }

  async notificationForUpdateStatusOrder(
    orderId: string,
    userId: any,
    imageUrl: string,
    status: OrderStatus,
  ) {
    let statusMessage = '';
    switch (status) {
      case OrderStatus.PROCESSING:
        statusMessage = 'đang được xử lý';
        break;
      case OrderStatus.SHIPPING:
        statusMessage = 'đã được gửi cho đơn vị vận chuyển';
        break;
      case OrderStatus.DELIVERED:
        statusMessage = 'đã được giao';
        break;
      case OrderStatus.COMPLETED:
        statusMessage = 'đã hoàn tất';
        break;
      case OrderStatus.CANCELED:
        statusMessage = 'đã bị hủy';
        break;
      default:
        statusMessage = 'đang chờ xử lý';
    }
    const order_url = `${this.configService.get(
      'ORDER_USER_ENDPOINT',
    )}/${orderId}`;
    const data = {
      receiver: userId,
      title: 'Đơn hàng',
      type: NotificationType.ORDER,
      message: `Đơn hàng ${orderId} ${statusMessage}.`,
      image_url: imageUrl,
      target_url: order_url,
    };
    const notify = await this.notificationService.createNotification(data);
    this.eventsGateway.sendNotification<UserNotification>({
      userId: userId,
      message: notify,
    });
  }

  async createCodOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    const { name, phone, address } = createOrderDto;
    const { email } = user;

    const cart = await this.cartService.validateCart(user._id, null);
    const newItems = await this.mapToCartOrder(cart.items);

    const newOrder = new this.orderModel({
      user: user._id.toString(),
      name,
      email,
      items: newItems,
      address,
      total: cart.subTotal,
      phone,
      method: OrderMethod.COD,
    });

    // calculate sold & stock quantity each item.
    this.inventoryCount(cart.items, false);
    this.soldCount(cart.items, false);

    const createOrder = await newOrder.save();

    await this.cartService.emptyCart(cart._id);

    this.notificationForCreateOrder(createOrder.toObject());

    return createOrder;
  }

  // Create Checkout Session = Stripe to Payment
  async createCheckout(createOrderDto: CreateOrderDto, user: User) {
    const { name, phone, address } = createOrderDto;

    // Checkout items in cart
    // Get cart
    const cart = await this.cartService.getCart(user);

    //validate before checkout
    await Promise.all(
      cart.items.map(async (item) => {
        await this.productService.validateProduct(
          item.productId._id.toString(),
        );
        await this.validateItem(item.variantId._id.toString(), item.quantity);
      }),
    );

    // sub inventory quantity before checkout process
    await this.inventoryCount(cart.items, false);

    const customer = await this.stripe.customers.create({
      metadata: {
        name,
        user: user._id.toString(),
        phone,
        address: JSON.stringify(address),
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cart.items.map((item) => {
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

  stripeWebhook(signature: string, req: Request) {
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
          this.createOrderByStripe(customer as Stripe.Customer, data);
        })
        .catch((err: any) => console.log(err.message));
    }

    if (
      eventType === 'checkout.session.expired' ||
      eventType === 'payment_intent.canceled' ||
      eventType === 'payment_intent.payment_failed'
    ) {
      this.stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          this.abortStripeCheckout(customer as Stripe.Customer);
        })
        .catch((err: any) => console.log(err.message));
    }
    // Return a res to acknowledge receipt of the event
  }

  async mapToCartOrder(cartItems: Item[]) {
    const newItems = await Promise.all(
      cartItems.map(async (item: Item) => {
        const product = await this.productService.getProductWithoutJoin(
          item.productId._id.toString(),
        );
        const variant = await this.variantService.getVariantWithoutJoin(
          item.variantId._id.toString(),
        );
        const { images, product_sku, title, price } = product;
        const { inventory, size, color, productId } = variant;
        return {
          ...item,
          productId: { _id: item.productId, images, product_sku, title, price },
          variantId: { _id: item.variantId, inventory, size, color, productId },
        };
      }),
    );

    return newItems;
  }

  async abortStripeCheckout(customer: Stripe.Customer) {
    const user = await this.userService.getUser(customer.metadata.user);

    const cart = await this.cartService.getCart(user);

    // recover inventory quantity when checkout canceled.
    await this.inventoryCount(cart.items, true);
  }

  async createOrderByStripe(customer: Stripe.Customer, data: any) {
    const user = await this.userService.getUser(customer.metadata.user);
    const { email } = user;

    const address = JSON.parse(customer.metadata.address);
    const cart = await this.cartService.getCart(user);

    const newItems = await this.mapToCartOrder(cart.items);

    const newOrder = new this.orderModel({
      user: customer.metadata.user,
      name: customer.metadata.name,
      email,
      items: newItems,
      paymentId: data.payment_intent,
      address,
      total: data.amount_total / 100,
      phone: customer.metadata.phone,
      method: OrderMethod.STRIPE_CREDIT_CARD,
      isPaid: true,
    });

    this.soldCount(cart.items, false);

    const orderData = await newOrder.save();

    await this.cartService.emptyCart(cart._id);
    this.notificationForCreateOrder(orderData);

    return orderData;
  }

  async refundOrder(id: string) {
    try {
      const order = await this.getOrder(id);

      const paymentIntentId = order.paymentId;
      if (order.method === OrderMethod.STRIPE_CREDIT_CARD) {
        await this.stripe.refunds.create({
          payment_intent: paymentIntentId,
        });
      }

      if (order.method === OrderMethod.PAYPAL_CREDIT_CARD) {
        await this.paypalService.refundPayment(paymentIntentId, order.total);
      }

      const newOrder = await this.orderModel.findByIdAndUpdate(
        id,
        { status: OrderStatus.CANCELED },
        { new: true },
      );

      const items = (newOrder.items as any).map((item: any) => {
        return {
          ...item,
          productId: item.productId._id,
        };
      });

      await this.inventoryCount(items, true);

      this.soldCount(items, true);

      return newOrder;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Lỗi khi hoàn tiền.');
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
    const values = Object.values(OrderStatus);
    if (!values.includes(status as unknown as OrderStatus)) {
      return new BadRequestException(`Yêu cầu không hợp lệ.`);
    }
    const oldOrder = await this.orderModel.findById(id);

    if (
      oldOrder.status === OrderStatus.COMPLETED ||
      oldOrder.status === OrderStatus.CANCELED
    ) {
      return new BadRequestException('Yêu cầu không hợp lệ.');
    }
    if (oldOrder.status === status) return oldOrder;

    let isPaid = oldOrder.isPaid;
    if (status === OrderStatus.COMPLETED) {
      isPaid = true;
    }
    const newOrder = await this.orderModel
      .findByIdAndUpdate(id, { status, isPaid }, { new: true })
      .lean();

    if (status === OrderStatus.CANCELED) {
      const items = (newOrder.items as any).map((item: any) => {
        return {
          ...item,
          productId: item.productId._id,
        };
      });

      await this.inventoryCount(items, true);

      this.soldCount(items, true);
    }

    this.notificationForUpdateStatusOrder(
      newOrder._id.toString(),
      newOrder.user,
      newOrder.items[0].productId.images[0].url,
      status,
    );

    return newOrder;
  }

  async cancelOrder(id: string, user: User) {
    const oldOrder = await this.getMyOrder(id, user);

    if (oldOrder.status === OrderStatus.CANCELED) {
      return new BadRequestException(`Đơn hàng: ${id} đã được hủy.`);
    }

    if (
      oldOrder.status === OrderStatus.SHIPPING ||
      oldOrder.status === OrderStatus.DELIVERED ||
      oldOrder.status === OrderStatus.COMPLETED
    ) {
      return new BadRequestException(`Đơn hàng: ${id} không thể hủy.`);
    }

    if (
      oldOrder.method === OrderMethod.STRIPE_CREDIT_CARD ||
      oldOrder.method === OrderMethod.PAYPAL_CREDIT_CARD
    ) {
      return this.refundOrder(id);
    } else {
      const newOrder = await this.orderModel.findByIdAndUpdate(
        id,
        { status: OrderStatus.CANCELED },
        { new: true },
      );

      const items = (newOrder.items as any).map((item: any) => {
        return {
          ...item,
          productId: item.productId._id,
        };
      });

      await this.inventoryCount(items, true);

      this.soldCount(items, true);

      return newOrder;
    }
  }

  soldCount(items: OrderItem[], resold: boolean) {
    const soldQuantities: { [key: string]: number } = {};

    items.forEach((item) => {
      const productId = item.productId._id.toString();
      const quantity = item.quantity;

      // If the product is already in the dictionary, add the quantity to its current value
      if (soldQuantities[productId]) {
        soldQuantities[productId] += quantity;
      } else {
        // If not, initialize it with the current quantity
        soldQuantities[productId] = quantity;
      }
    });

    Object.entries(soldQuantities).map(([key, value]) => {
      console.log(`Product ID: ${key}, Quantity Sold: ${value}`);
      return this.updateNewSold(key, value, resold);
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

  async inventoryCount(items: Item[], resold: boolean) {
    await this.variantService.updateInventory(items, resold);
  }

  /**
   * Create an order to start the transaction.
   * See https://developer.paypal.com/docs/api/orders/v2/#orders_create
   */
  async createPaypalTransaction(user: User, data: PaypalTransactionDto) {
    // use the cart information passed from the front-end to calculate the purchase unit details
    const cart = await this.cartService.validateCart(user._id, null);

    // check cart valid before checkout
    await Promise.all(
      cart.items.map(async (item) => {
        await this.productService.validateProduct(
          item.productId._id.toString(),
        );
        await this.validateItem(item.variantId._id.toString(), item.quantity);
      }),
    );

    const baseUrl = this.configService.get('PAYPAL_BASE_URL');

    const accessToken = await this.paypalService.generateAccessToken();
    const url = `${baseUrl}/v2/checkout/orders`;

    const date = new Date();
    const createDate = date
      .toISOString()
      .slice(0, 19)
      .replace('T', '')
      .replace(/[-:]/g, '');
    const transactionId = createDate + Math.floor(Math.random() * 1000000);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: cart.subTotal.toFixed(2),
          },
          custom_id: transactionId, // Example of custom data
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    };

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    try {
      const jsonResponse = await response.json();
      const transaction_data: PaypalTransactionDataType = {
        ...data,
        userId: user._id.toString(),
        email: user.email,
      };
      await this.redisService.setTransaction(transactionId, transaction_data);

      // sub inventory quantity before checkout process
      await this.inventoryCount(cart.items, false);

      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } catch (err) {
      const errorMessage = await response.text();
      throw new BadGatewayException(errorMessage);
    }
  }

  // save order to DB
  async createOrderByPaypal(transactionId: string, captureID: string) {
    const transactionData =
      await this.redisService.getTransaction<PaypalTransactionDataType>(
        transactionId,
      );
    try {
      const { userId, email, name, phone, address } = transactionData;
      const cart = await this.cartService.validateCart(
        new Types.ObjectId(userId),
        null,
      );
      const newItems = await this.mapToCartOrder(cart.items);

      const newOrder = new this.orderModel({
        user: userId,
        name,
        email,
        items: newItems,
        paymentId: captureID,
        address,
        total: cart.subTotal,
        phone,
        method: OrderMethod.PAYPAL_CREDIT_CARD,
        isPaid: true,
      });

      // calculate sold quantity each item.
      this.soldCount(cart.items, false);

      const createOrder = await newOrder.save();

      await this.cartService.emptyCart(cart._id);

      // send message checkout complete to client when create order completed.
      this.eventsGateway.orderTransactionSucessEvent(transactionData.socketId);

      // delete data transaction from redis when create order completed.
      await this.redisService.deleteTransaction(transactionId);

      this.notificationForCreateOrder(createOrder.toObject());

      return createOrder;
    } catch (err) {
      console.log(err);
      // global._io.to(`${orderData.socketId}`).emit('ORDER_FAILED', { msg: err.message })
      this.eventsGateway.orderTransactionFailedEvent(
        transactionData.socketId,
        err.message,
      );
      throw new BadGatewayException(err.message);
    }
  }

  async abortPaypalCheckout(transactionId: string) {
    const transactionData =
      await this.redisService.getTransaction<PaypalTransactionDataType>(
        transactionId,
      );
    console.log('REDIS STORE', transactionData);

    const { userId } = transactionData;

    const cart = await this.cartService.validateCart(
      new Types.ObjectId(userId),
      null,
    );

    // Recover inventory quantity when checkout canceled.
    await this.inventoryCount(cart.items, true);

    // delete data transaction from redis when checkout canceled.
    await this.redisService.deleteTransaction(transactionId);
  }

  async paypalWebhook(req: Request) {
    const webhookEvent = req.body;
    const transactionId = webhookEvent.resource.custom_id;
    const captureID = webhookEvent.resource.id;
    const transactionData =
      await this.redisService.getTransaction<PaypalTransactionDataType>(
        transactionId,
      );
    try {
      const isValid = await this.paypalService.verifyWebhook(
        req.headers,
        webhookEvent,
      );
      if (isValid) {
        // Process the webhook event
        console.log('Webhook event', webhookEvent);

        if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          await this.createOrderByPaypal(transactionId, captureID);
        }

        if (webhookEvent.event_type === 'CHECKOUT.PAYMENT-APPROVAL.REVERSED') {
          await this.abortPaypalCheckout(transactionId);
        }

        if (webhookEvent.event_type === 'PAYMENT.CAPTURE.DENIED') {
          await this.abortPaypalCheckout(transactionId);
        }
      } else {
        this.eventsGateway.orderTransactionFailedEvent(
          transactionData.socketId,
          'Server Error: Invalid webhook event',
        );
        console.log('Invalid webhook event');
      }
    } catch (error) {
      this.eventsGateway.orderTransactionFailedEvent(
        transactionData.socketId,
        'Server Error: Invalid webhook event',
      );
      console.error('Error verifying webhook', error);
    }

    return { message: 'Đặt hàng thành công.' };
  }

  async createVnpayCheckout(
    req: Request,
    user: User,
    vnpayCheckoutData: VnpayCheckoutDto,
  ) {
    // use the cart information passed from the front-end to calculate the purchase unit details
    const cart = await this.cartService.validateCart(user._id, null);

    // check cart valid before checkout
    await Promise.all(
      cart.items.map(async (item) => {
        await this.productService.validateProduct(
          item.productId._id.toString(),
        );
        await this.validateItem(item.variantId._id.toString(), item.quantity);
      }),
    );

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const orderInfo = `Thanh toán cho đơn hàng của Thivlevel`;

    const amount = await this.currencyService.convertUSDtoVND(cart.subTotal);

    const transactionData = {
      ...vnpayCheckoutData,
      userId: user._id.toString(),
      email: user.email,
    };
    // Call service to generate the VNPAY payment URL
    const paymentUrl = await this.vnpayService.createVnpayPaymentUrl(
      transactionData,
      orderInfo,
      amount,
      ipAddr,
    );

    return { paymentUrl };
  }

  // save order to DB
  async createOrderByVnpay(orderId: string, transactionNo: string) {
    try {
      // retrive data transaction form redis
      const transactionData =
        await this.redisService.getTransaction<VnpayTransactionDataType>(
          orderId,
        );
      console.log('REDIS STORE', transactionData);

      const { userId, email, name, phone, address } = transactionData;
      const cart = await this.cartService.validateCart(
        new Types.ObjectId(userId),
        null,
      );
      const newItems = await this.mapToCartOrder(cart.items);

      const newOrder = new this.orderModel({
        user: userId,
        name,
        email,
        items: newItems,
        paymentId: transactionNo,
        vnPayRefId: orderId,
        address,
        total: cart.subTotal,
        phone,
        method: OrderMethod.VNPAY,
        isPaid: true,
      });

      // calculate sold & stock quantity each item.
      this.inventoryCount(cart.items, false);
      this.soldCount(cart.items, false);

      const createOrder = await newOrder.save();

      await this.cartService.emptyCart(cart._id);

      // delete data transaction from redis when create order completed.
      await this.redisService.deleteTransaction(orderId);

      this.notificationForCreateOrder(createOrder.toObject());

      return createOrder;
    } catch (err) {
      console.log(err);
      throw new BadGatewayException(err.message);
    }
  }

  // * ADMIN * //
  async getTotalRevenue() {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null, // No specific grouping needed
          totalSum: { $sum: '$total' },
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalSum : 0;

    return totalRevenue;
  }

  async updateOrder(id: string, updateDto: UpdateOrderDto) {
    return await this.orderModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate([
        {
          path: 'user',
          select: '_id username email avatar phone gender',
        },
      ])
      .lean();
  }
}
