import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './products.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { VariantService } from 'src/variant/variant.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private variantService: VariantService,
  ) {}

  async getProduct(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product id: ${id} is not exist.`);
    }
    return product;
  }

  async getProducts(): Promise<Product[]> {
    return this.productModel
      .find()
      .populate('variants', 'size color inventory productId');
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const {
      product_id,
      title,
      description,
      content,
      price,
      images,
      category,
      variants,
    } = createProductDto;

    const newProduct = new this.productModel({
      product_id,
      title: title.toLowerCase(),
      content,
      description,
      price,
      images,
      category,
    });

    await Promise.all(
      variants.map(async (item) => {
        const variant = {
          size: item.size,
          color: item.color,
          inventory: item.inventory,
          productId: newProduct._id,
        };

        const newVariant = await this.variantService.createVariant(variant);

        newProduct.variants.push(newVariant);
      }),
    );

    return newProduct.save();
  }
}
