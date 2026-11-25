import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import {
  NewsletterSubscriber,
  NewsletterSubscriberDocument,
} from './newsletter.schema';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriber.name)
    private readonly subscriberModel: Model<NewsletterSubscriberDocument>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    if (dto.website) {
      return { success: true };
    }

    const email = dto.email.trim().toLowerCase();
    await this.subscriberModel.updateOne(
      { email },
      {
        $set: {
          active: true,
          source: dto.source || 'website_footer',
        },
        $setOnInsert: { email },
      },
      { upsert: true },
    );

    return { success: true };
  }
}
