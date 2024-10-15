import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotificationType } from './enum/notificaton.enum';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }

  _id?: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ default: NotificationType.GENERAL })
  type: NotificationType;

  @Prop({ type: String })
  variables?: string;

  @Prop({ type: String })
  image_url?: string;

  @Prop({ type: String })
  target_url?: string;

  @Prop({ type: Boolean, default: false })
  private: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
