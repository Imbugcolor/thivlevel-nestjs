import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MongooseModule } from '@nestjs/mongoose';
import { VariantModule } from './variant/variant.module';
import { ReviewModule } from './review/review.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
import { ItemModule } from './item/item.module';
import { OrderModule } from './order/order.module';
import { StripeModule } from 'nestjs-stripe';
import { RawBodyMiddleware } from './middleware/raw-body.middleware';
import { JsonBodyMiddleware } from './middleware/json-body.middleware';
import { StripeWebhookController } from './stripe-webhook/stripe-webhook.controller';
import { StripeWebhookModule } from './stripe-webhook/stripe-webhook.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { SendmailModule } from './sendmail/sendmail.module';
import { PaypalModule } from './paypal/paypal.module';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        useUnifiedTopology: false,
      }),
    }),
    ProductsModule,
    VariantModule,
    ReviewModule,
    UserModule,
    CategoryModule,
    CartModule,
    ItemModule,
    OrderModule,
    StripeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_KEY'),
        apiVersion: '2022-11-15',
      }),
    }),
    StripeWebhookModule,
    CloudinaryModule,
    UploadModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('MAIL_USERNAME'),
            pass: configService.get('MAIL_PASSWORD_APP'),
          },
        },
      }),
    }),
    SendmailModule,
    PaypalModule,
    RedisModule,
    EventsModule,
    OtpModule,
  ],
  controllers: [StripeWebhookController],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/webhook',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
