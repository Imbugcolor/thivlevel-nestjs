import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Item } from './item.schema';
import { Model } from 'mongoose';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  async createItem(createItemDto: CreateItemDto): Promise<Item> {
    const item = new this.itemModel(createItemDto);
    return item.save();
  }

  async updateItem(id: string, item: any): Promise<Item> {
    return this.itemModel.findByIdAndUpdate(id, item, { new: true });
  }
}
