import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/order/order.schema';

@Injectable()
export class LarkService {
  constructor(private readonly httpService: HttpService) {}

  async sendDataToLark<T>(data: T): Promise<void> {
    const url =
      'https://open-sg.larksuite.com/anycross/trigger/callback/MGRlZmZkNDQyMGQxNTNmM2JkNDExZDg2ZTc0N2FhMmFh';

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      console.log('Webhook response:', response.data);
    } catch (error) {
      console.error('Error sending data to webhook:', error.message);
    }
  }

  async sendOrderCreatedToLark(data: Order): Promise<void> {
    return this.sendDataToLark<Order>(data);
  }
}
