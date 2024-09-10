import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalService {
  constructor(private configService: ConfigService) {}

  private base = this.configService.get('PAYPAL_BASE_URL');

  private PAYPAL_CLIENT_ID = this.configService.get('PAYPAL_CLIENT_ID');
  private PAYPAL_CLIENT_SECRET = this.configService.get('PAYPAL_CLIENT_SECRET');
  private PAYPAL_WEBHOOK_ID = this.configService.get('PAYPAL_WEBHOOK_ID');

  public async handleResponse(response: Response) {
    try {
      const jsonResponse = await response.json();
      return {
        jsonResponse,
        httpStatusCode: response.status,
      };
    } catch (err) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }

  /**
   * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
   * See https://developer.paypal.com/api/rest/authentication/
   */
  public async generateAccessToken() {
    try {
      if (!this.PAYPAL_CLIENT_ID || !this.PAYPAL_CLIENT_SECRET) {
        throw new Error('MISSING_API_CREDENTIALS');
      }
      const auth = Buffer.from(
        this.PAYPAL_CLIENT_ID + ':' + this.PAYPAL_CLIENT_SECRET,
      ).toString('base64');
      const response = await fetch(`${this.base}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to generate Access Token:', error);
    }
  }

  /**
   * Generate a client token for rendering the hosted card fields.
   * See https://developer.paypal.com/docs/checkout/advanced/sdk/v1/#link-integratebackend
   */
  public async generateClientToken() {
    const accessToken = await this.generateAccessToken();
    const url = `${this.base}/v1/identity/generate-token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json',
      },
    });

    const jsonResponse = await response.json();
    return {
      clientId: this.PAYPAL_CLIENT_ID,
      clientToken: jsonResponse.client_token,
    };
  }

  /* verify webhook */
  async verifyWebhook(headers, webhookEvent) {
    const auth = Buffer.from(
      `${this.PAYPAL_CLIENT_ID}:${this.PAYPAL_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch(
      'https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: this.PAYPAL_WEBHOOK_ID,
          webhook_event: webhookEvent,
        }),
      },
    );

    const body = await response.json();
    return body.verification_status === 'SUCCESS';
  }

  /**
   * Capture payment for the created order to complete the transaction.
   * See https://developer.paypal.com/docs/api/orders/v2/#orders_capture
   */
  async captureOrder(orderID: string) {
    const accessToken = await this.generateAccessToken();
    const url = `${this.base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
    });

    return this.handleResponse(response);
  }

  encodeObjectToBase64(object: { [key: string]: any }) {
    const objectString = JSON.stringify(object);
    return Buffer.from(objectString).toString('base64');
  }

  generatePayPalAuthAssertion() {
    const clientId = this.PAYPAL_CLIENT_ID;
    // const sellerPayerId = 'SELLER-PAYER-ID'; // preferred
    const sellerEmail = this.configService.get('PAYPAL_SELLER_EMAIL'); // use instead if payer-id unknown

    const header = {
      alg: 'none',
    };
    const encodedHeader = this.encodeObjectToBase64(header);

    const payload = {
      iss: clientId,
      // payer_id: sellerPayerId,
      email: sellerEmail,
    };
    const encodedPayload = this.encodeObjectToBase64(payload);

    const jwt = `${encodedHeader}.${encodedPayload}.`; // json web token
    console.log(`Paypal-Auth-Assertion=${jwt}`);
    return jwt;
  }

  // async refundPayment(captureID: string) {
  //   // /v2/payments/captures/2GG279541U471931P/refund
  //   const accessToken = await this.generateAccessToken();
  //   const url = `${this.base}/v2/payments/captures/${captureID}/refund`;
  // }
}
