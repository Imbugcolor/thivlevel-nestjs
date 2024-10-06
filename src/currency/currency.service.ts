import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
  constructor(private configService: ConfigService) {}

  private async getExchangeRate(currency_code = 'VND') {
    const apiKey = this.configService.get('CURRENCY_LAYER_API_KEY'); // Replace with your CurrencyLayer API key
    const url = `http://api.currencylayer.com/live?access_key=${apiKey}&currencies=${currency_code}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.quotes.USDVND; // Get the VND rate from the response
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw new BadRequestException('Error fetching exchange currency rate');
    }
  }

  async convertUSDtoVND(usdAmount: number) {
    const exchangeRate = await this.getExchangeRate();
    const vndAmount = usdAmount * exchangeRate;
    return vndAmount;
  }
}
