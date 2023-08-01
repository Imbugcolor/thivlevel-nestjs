import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles } from 'src/user/auth/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { RolesGuard } from 'src/user/auth/roles.guard';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { ProductsDataResponse } from './type/productsDataResponse.type';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Get()
  async getProducts(@Req() req: Request): Promise<ProductsDataResponse> {
    return this.productService.getProducts(req);
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.getProduct(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @Patch('/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.Admin)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateProduct(id, updateProductDto);
  }
}
