export interface OrderMenu {
  id: number;
  name: string;
  description: string;
  image: string | null;
  category: string;
  price: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  quantity: number;
  price: string;
  note: string | null;
  createdAt: string;
  menu: OrderMenu;
}

export interface OrderTable {
  id: number;
  number: number;
  capacity: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  tableId: number;
  source: string;
  status: "PAID" | "SERVED" | string;
  nameCustomer: string | null;
  subtotal: string;
  serviceCharge: string;
  total: string;
  isPaid: boolean;
  amountReceived: string | null;
  changeAmount: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  table: OrderTable;
  items: OrderItem[];
}

export interface CreateOrderItem {
  menuId: number;
  quantity: number;
  note?: string;
}

export type CreateOrderPayload = {
  tableId: number;
  source: string;
  nameCustomer: string | null;
  items: {
    menuId: number;
    quantity: number;
    note?: string;
  }[];
};
