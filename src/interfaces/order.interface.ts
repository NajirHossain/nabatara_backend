export interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price?: number;
  size?: string | null;
}

export interface CreateOrderBody {
  shipping_address_id: string;
  items: OrderItem[];
}
