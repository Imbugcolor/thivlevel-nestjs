import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Item } from 'src/item/item.schema';
import { User } from 'src/user/user.schema';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: Item.name }] })
  items: Item[];

  @Prop({ type: Number, default: 0 })
  subTotal: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
