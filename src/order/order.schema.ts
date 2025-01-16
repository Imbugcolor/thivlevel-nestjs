import { User } from 'src/user/user.schema';
import { AddressType } from 'src/utils/address.type';
import { OrderMethod } from './enum/order-method.enum';
import { OrderStatus } from './enum/order-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order {
  _id?: Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  // @Prop({ type: mongoose.Types.ObjectId, ref: Payment.name })
  // paymentId: Payment;

  @Prop({ type: String })
  paymentId: string;

  @Prop({ type: String })
  vnPayRefId: string;

  @Prop()
  address: AddressType;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ default: OrderMethod.COD })
  method: OrderMethod;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Array, required: true })
  items: any[];

  @Prop({ default: OrderStatus.PENDING })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ name: 'text', email: 'text', phone: 'text', _id: 'text' });
