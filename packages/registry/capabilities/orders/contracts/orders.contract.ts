import type { Result } from "../shared/result.js";
import type { OrderOutput } from "../application/dto/order-output.dto.js";
import type { PlaceOrderInput } from "../application/dto/place-order-input.dto.js";

export type { OrderOutput, OrderItemOutput, AddressOutput } from "../application/dto/order-output.dto.js";
export type { PlaceOrderInput, PlaceOrderItemInput, AddressInput } from "../application/dto/place-order-input.dto.js";

export interface IOrderService {
  placeOrder(input: PlaceOrderInput): Promise<Result<{ orderId: string }, Error>>;
  confirmOrder(orderId: string): Promise<Result<void, Error>>;
  shipOrder(orderId: string): Promise<Result<void, Error>>;
  cancelOrder(orderId: string): Promise<Result<void, Error>>;
  getOrder(orderId: string): Promise<Result<OrderOutput, Error>>;
  listOrders(): Promise<Result<OrderOutput[], Error>>;
}
