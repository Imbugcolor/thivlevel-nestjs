import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './products.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { VariantService } from 'src/variant/variant.service';
import { UpdateProductDto } from './dto/update-product.dto';

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

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const oldProduct = await this.productModel.findById(id);

    const { title, description, content, price, images, category, variants } =
      updateProductDto;

    await this.productModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        content,
        price,
        images,
        category,
      },
      { new: true },
    );

    // Remove variants in variants schema if it removed in variants field of products schema
    const ids: any[] = [];
    variants.map((item) => {
      if (item._id) {
        return ids.push(item._id);
      }
    });

    const removeVariants = oldProduct.variants.filter(
      (item) => !ids.includes(item.toString()),
    );

    oldProduct.variants = oldProduct.variants.filter(
      (item) => !removeVariants.includes(item),
    );

    await oldProduct.save();

    await this.variantService.deleteVariants(removeVariants);

    // Update Variants - Add new Variants
    await Promise.all(
      variants.map(async (item) => {
        if (!item._id) {
          const newVariant = await this.variantService.createVariant(item);

          await this.productModel.findByIdAndUpdate(
            id,
            {
              $push: {
                variants: newVariant,
              },
            },
            { new: true },
          );
        } else {
          const variant = {
            _id: item._id,
            size: item.size,
            color: item.color,
            inventory: item.inventory,
          };
          await this.variantService.updateVariant(variant);
        }
      }),
    );

    const product = await this.getProduct(id);

    return product;
  }
}
