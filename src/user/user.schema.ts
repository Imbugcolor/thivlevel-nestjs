import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserGender } from './enum/user-gender.enum';
import { UserTypeLogin } from './enum/user-type-login.enum';
import { AddressType } from '../utils/address.type';
import { Role } from './enum/role.enum';
import { Expose } from 'class-transformer';

@Schema({ timestamps: true })
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  _id: mongoose.Types.ObjectId;

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
  address: AddressType;

  @Prop({ default: UserGender.MALE })
  @Expose()
  gender: UserGender;

  @Prop()
  @Expose()
  dateOfbirth: string;

  @Prop({ default: UserTypeLogin.NORMAL })
  @Expose()
  type: UserTypeLogin;

  @Prop()
  rf_token: string;

  @Expose()
  accessToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
