export type {
  PlaceOrderInput,
  PlaceOrderItemInput,
  AddressInput,
  OrderOutput,
  OrderItemOutput,
  AddressOutput,
  IOrderService,
} from "./orders.contract.js";

export { createOrderService } from "./orders.factory.js";
export type { OrderServiceDeps } from "./orders.factory.js";
