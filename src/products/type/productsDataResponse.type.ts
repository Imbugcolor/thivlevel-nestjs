import { Product } from '../products.schema';

export type ProductsDataResponse = {
  total: number;
  data: {
    length: number;
    products: Product[];
  };
};
