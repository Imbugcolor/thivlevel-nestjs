import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserGender } from './enum/user-gender.enum';
import { UserTypeLogin } from './enum/user-type-login.enum';
import { AddressType } from '../utils/address.type';
import { Role } from './enum/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dnv2v2tiz/image/upload/v1679802559/instagram-avt-profile/unknow_fc0uaf.jpg',
  })
  avatar: string;

  @Prop({ default: [Role.User] })
  role: Role[];

  @Prop()
  phone: string;

  @Prop()
  address: AddressType;

  @Prop({ default: UserGender.MALE })
  gender: UserGender;

  @Prop()
  dateOfbirth: string;

  @Prop({ default: UserTypeLogin.NORMAL })
  type: UserTypeLogin;

  @Prop()
  rf_token: string;

  _doc: any;
}

export const UserSchema = SchemaFactory.createForClass(User);
