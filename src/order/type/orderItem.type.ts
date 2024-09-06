import { Product } from 'src/products/products.schema';
import { Variant } from 'src/variant/variant.schema';

export type OrderItem = {
  productId: Product;
  quantity: number;
  price: number;
  variantId: Variant;
};
