import type { Result } from "../shared/result.js";
import type { OrderOutput } from "../application/dto/order-output.dto.js";
import type { PlaceOrderInput } from "../application/dto/place-order-input.dto.js";
import type { OrderNotFound } from "../domain/errors/order-not-found.error.js";
import type { OrderAlreadyCanceled } from "../domain/errors/order-already-canceled.error.js";
import type { InvalidOrderTransition } from "../domain/errors/invalid-order-transition.error.js";
import type { InvalidOrder } from "../domain/errors/invalid-order.error.js";
import type { InvalidAddress } from "../domain/errors/invalid-address.error.js";
import type { InvalidOrderItem } from "../domain/errors/invalid-order-item.error.js";
import type { InvalidOrderStatus } from "../domain/errors/invalid-order-status.error.js";

export type { OrderOutput, OrderItemOutput, AddressOutput } from "../application/dto/order-output.dto.js";
export type { PlaceOrderInput, PlaceOrderItemInput, AddressInput } from "../application/dto/place-order-input.dto.js";

export interface IOrderService {
  placeOrder(
    input: PlaceOrderInput,
  ): Promise<
    Result<
      { orderId: string },
      InvalidOrder | InvalidAddress | InvalidOrderItem | InvalidOrderStatus
    >
  >;
  confirmOrder(
    orderId: string,
  ): Promise<Result<void, OrderNotFound | OrderAlreadyCanceled | InvalidOrderTransition>>;
  shipOrder(
    orderId: string,
  ): Promise<Result<void, OrderNotFound | OrderAlreadyCanceled | InvalidOrderTransition>>;
  cancelOrder(
    orderId: string,
  ): Promise<Result<void, OrderNotFound | OrderAlreadyCanceled | InvalidOrderTransition>>;
  getOrder(orderId: string): Promise<Result<OrderOutput, OrderNotFound>>;
  listOrders(): Promise<Result<OrderOutput[], never>>;
}
