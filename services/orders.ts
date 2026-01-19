// services/orders.ts
import { apiFetch } from "./api";

export type CreateOrderItem = {
  cylinderId: string;   // backend expects string (your schema uses String)
  productName: string;  // REQUIRED by Joi
  quantity: number;
  unitPrice: number;    // REQUIRED by Joi (positive)
};

export type CreateOrderPayload = {
  deliveryAddressId: string;
  items: CreateOrderItem[];

  recipientName?: string;
  recipientPhone?: string;
  isExpress?: boolean;
  promoCodeApplied?: string | null;
  paymentMethod?: "card" | "wallet" | "stripe" | "paystack" | "payOnPickup";
};

export type CreateOrderResponse = any;

export const orderApi = {
  async create(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listMyOrders(): Promise<any> {
    return apiFetch("/orders/my-orders", { method: "GET" });
  },

  async getById(orderId: string): Promise<any> {
    return apiFetch(`/orders/${orderId}`, { method: "GET" });
  },

  // ✅ Alias for older UI code
  async get(orderId: string): Promise<any> {
    return this.getById(orderId);
  },
};
