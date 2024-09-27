import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateItem(id: string, item: Partial<Item>): Promise<Item> {
    return this.itemModel.findByIdAndUpdate(id, item, { new: true });
  }

  async deleteItem(id: string): Promise<Item> {
    const item = this.itemModel.findByIdAndDelete(id);

    if (!item) {
      throw new NotFoundException(`This item id: ${id} not exists.`);
    }

    return item;
  }

  async deleteArrayItems(ids: Item[]): Promise<any> {
    return this.itemModel.deleteMany({ _id: { $in: ids } });
  }
}
