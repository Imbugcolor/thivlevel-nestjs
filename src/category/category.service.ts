import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Product } from 'src/products/products.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
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
      throw new ConflictException('Danh mục đã tồn tại.');
    }
    const category = new this.categoryModel({ name });

    return category.save();
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const { name } = updateCategoryDto;

    const isExist = await this.categoryModel.findOne({ name });

    if (isExist) {
      throw new ConflictException('Danh mục đã tồn tại.');
    }
    const category = await this.categoryModel
      .findByIdAndUpdate(id, { name }, { new: true })
      .lean();

    return category;
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    const products = await this.productModel.find({
      category: id,
    });

    if (products.length > 0) {
      throw new BadRequestException('Không thể xóa danh mục hiện tại.');
    }

    await this.categoryModel.findByIdAndDelete(id);

    return { message: 'Deleted' };
  }
}
