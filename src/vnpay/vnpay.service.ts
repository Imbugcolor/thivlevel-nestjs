import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OrderService } from 'src/order/order.service';
import { VnpayTransactionDataType } from 'src/order/type/transaction.type';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class VnpayService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    @Inject(forwardRef(() => OrderService))
    private orderService: OrderService,
  ) {}
  async createVnpayPaymentUrl(
    orderData: VnpayTransactionDataType,
    orderInfor: string,
    amount: number,
    ipAddr: string | string[],
  ) {
    const tmnCode = this.configService.get('VNPAY_VNP_TMNCODE');
    const secretKey = this.configService.get('VNPAY_VNP_HASHSECRET');
    const returnUrl = this.configService.get('VNPAY_VNP_RETURN_URL');
    const vnpUrl = this.configService.get('VNPAY_VNP_URL');

    const date = new Date();
    const createDate = date
      .toISOString()
      .slice(0, 19)
      .replace('T', '')
      .replace(/[-:]/g, '');
    const orderId = createDate + Math.floor(Math.random() * 1000000);

    const orderType = 'billpayment';
    const currCode = 'VND';
    const locale = 'vn';

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: amount * 100, // VNPAY expects amount in cents
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfor,
      vnp_OrderType: orderType,
      vnp_Locale: locale,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort the parameters alphabetically by key for signature creation
    vnpParams = Object.keys(vnpParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
      }, {});

    // Create query string for VNPAY API
    const querystring = new URLSearchParams(vnpParams).toString();

    // Hashing the query string with the secret key
    const hmac = crypto.createHmac('sha512', secretKey);
    const signData = hmac
      .update(Buffer.from(querystring, 'utf-8'))
      .digest('hex');

    // Append the signature to the URL
    const vnpUrlWithSignature = `${vnpUrl}?${querystring}&vnp_SecureHash=${signData}`;

    // Set Transaction to Redis
    await this.redisService.setTransaction(orderId, orderData);

    return vnpUrlWithSignature;
  }

  vnpayVerifyReturnUrl(query: any) {
    const secureHash = query['vnp_SecureHash'];
    const secretKey = this.configService.get('VNPAY_VNP_HASHSECRET');
    const vnpParams = { ...query };

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
      }, {});

    const querystring = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', secretKey);
    const signData = hmac
      .update(Buffer.from(querystring, 'utf-8'))
      .digest('hex');

    if (secureHash === signData && query['vnp_ResponseCode'] === '00') {
      return { success: true, message: 'Payment success' };
    }

    return { success: false, message: 'Payment failed or invalid signature' };
  }

  async vnpayVerifyIpn(query: any) {
    const secretKey = this.configService.get('VNPAY_VNP_HASHSECRET');
    const vnpParams = { ...query };
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = Object.keys(vnpParams)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
      }, {});

    const querystring = new URLSearchParams(sortedParams).toString();

    const hmac = crypto.createHmac('sha512', secretKey);
    const signData = hmac
      .update(Buffer.from(querystring, 'utf-8'))
      .digest('hex');

    const orderId = vnpParams['vnp_TxnRef'];
    if (secureHash === signData) {
      if (vnpParams['vnp_ResponseCode'] === '00') {
        // Payment is successful
        const transactionNo = vnpParams['vnp_TransactionNo'];

        await this.orderService.createOrderByVnpay(orderId, transactionNo);

        return { message: 'IPN success', orderId: vnpParams['vnp_TxnRef'] };
      } else {
        await this.redisService.deleteTransaction(orderId);
        return { message: 'IPN failed', orderId: vnpParams['vnp_TxnRef'] };
      }
    } else {
      await this.redisService.deleteTransaction(orderId);
      return { message: 'Invalid checksum' };
    }
  }
}
