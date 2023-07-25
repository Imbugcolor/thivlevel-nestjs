import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async getCategories(): Promise<Category[]> {
    return this.categoryModel.find();
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const { name } = createCategoryDto;

    const isExist = await this.categoryModel.findOne({ name });

    if (isExist) {
      throw new ConflictException('This category is exists.');
    }
    const category = new this.categoryModel({ name });

    return category.save();
  }
}
