import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserGender } from './enum/user-gender.enum';
import { Role } from './enum/role.enum';
import { Expose, Type } from 'class-transformer';
import { ObjectIdToString } from 'src/utils/custom.transform';
import { AuthStrategy } from './enum/auth.strategy.enum';
import { AddressDto } from 'src/order/dto/shipping-address.dto';

@Schema({ timestamps: true })
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ObjectIdToString()
  _id?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  @Expose()
  username: string;

  @Prop({ required: true, trim: true, unique: true })
  @Expose()
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dnv2v2tiz/image/upload/v1679802559/instagram-avt-profile/unknow_fc0uaf.jpg',
  })
  @Expose()
  avatar: string;

  @Prop({ default: [Role.User] })
  @Expose()
  role: Role[];

  @Prop()
  @Expose()
  phone: string;

  @Prop()
  @Expose()
  @Type(() => AddressDto)
  address: AddressDto;

  @Prop({ default: UserGender.MALE })
  @Expose()
  gender: UserGender;

  @Prop()
  @Expose()
  dateOfbirth: string;

  @Prop({ default: AuthStrategy.LOCAL })
  @Expose()
  authStrategy: AuthStrategy;

  @Prop()
  rf_token: string;

  @Expose()
  accessToken?: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 'text', phone: 'text', email: 'text' });
