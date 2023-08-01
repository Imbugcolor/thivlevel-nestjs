import { Order } from '../order.schema';

export type OrdersDataResponse = {
  total: number;
  data: {
    length: number;
    orders: Order[];
  };
};
