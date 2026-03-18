import type { IOrderRepository } from "../application/ports/order-repository.port.js";
import { PlaceOrder } from "../application/use-cases/place-order.use-case.js";
import { ConfirmOrder } from "../application/use-cases/confirm-order.use-case.js";
import { ShipOrder } from "../application/use-cases/ship-order.use-case.js";
import { CancelOrder } from "../application/use-cases/cancel-order.use-case.js";
import { GetOrder } from "../application/use-cases/get-order.use-case.js";
import { ListOrders } from "../application/use-cases/list-orders.use-case.js";
import type { IOrderService } from "./orders.contract.js";
import { Result } from "../shared/result.js";

export type OrderServiceDeps = {
  orderRepository: IOrderRepository;
};

export function createOrderService(deps: OrderServiceDeps): IOrderService {
  const placeOrder = new PlaceOrder(deps.orderRepository);
  const confirmOrder = new ConfirmOrder(deps.orderRepository);
  const shipOrder = new ShipOrder(deps.orderRepository);
  const cancelOrder = new CancelOrder(deps.orderRepository);
  const getOrder = new GetOrder(deps.orderRepository);
  const listOrders = new ListOrders(deps.orderRepository);

  return {
    placeOrder: (input) =>
      placeOrder.execute(input).then((r) =>
        r.isOk() ? Result.ok({ orderId: r.unwrap().orderId }) : Result.fail(r.unwrapError()),
      ),
    confirmOrder: (orderId) =>
      confirmOrder.execute(orderId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    shipOrder: (orderId) =>
      shipOrder.execute(orderId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    cancelOrder: (orderId) =>
      cancelOrder.execute(orderId).then((r) =>
        r.isOk() ? Result.ok(undefined) : Result.fail(r.unwrapError()),
      ),
    getOrder: (orderId) => getOrder.execute(orderId),
    listOrders: () => listOrders.execute(),
  };
}
