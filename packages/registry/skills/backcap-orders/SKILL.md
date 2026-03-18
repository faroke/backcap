---
name: backcap-orders
description: >
  Backcap orders capability: DDD-structured order management for TypeScript backends.
  Domain layer contains Order aggregate root (with items, status state machine, shipping/billing addresses),
  OrderItem entity, OrderStatus value object (pending, confirmed, processing, shipped, delivered, canceled,
  refunded) with valid transitions map, Address value object, five domain events (OrderPlaced, OrderConfirmed,
  OrderShipped, OrderDelivered, OrderCanceled), and three typed errors (OrderNotFound, InvalidOrderTransition,
  OrderAlreadyCanceled). Application layer has six use cases (PlaceOrder, ConfirmOrder, ShipOrder, CancelOrder,
  GetOrder, ListOrders), plus IOrderRepository port interface. Public surface is IOrderService and
  createOrderService factory in contracts/. All expected failures return Result<T,E> — no thrown errors.
  Adapters: orders-express (order CRUD + lifecycle routes), orders-prisma (PrismaOrderRepository).
  Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-orders

The `orders` capability provides **order lifecycle management** for TypeScript backends. It is
structured in strict Clean Architecture layers and has zero npm dependencies in the domain and
application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

### Entities

| Entity      | File                                    | Key Fields                                                        |
|-------------|-----------------------------------------|-------------------------------------------------------------------|
| `Order`     | `domain/entities/order.entity.ts`       | id, items, status, shippingAddress, billingAddress, totalCents     |
| `OrderItem` | `domain/entities/order-item.entity.ts`  | id, productId, quantity, unitPriceCents, lineTotal                 |

### Value Objects

| VO            | File                                          | Validation                                                        |
|---------------|-----------------------------------------------|-------------------------------------------------------------------|
| `OrderStatus` | `domain/value-objects/order-status.vo.ts`     | pending, confirmed, processing, shipped, delivered, canceled, refunded |
| `Address`     | `domain/value-objects/address.vo.ts`          | street, city, country, postalCode (all required, trimmed)         |

### Events

| Event            | File                                              | Fields                              |
|------------------|---------------------------------------------------|-------------------------------------|
| `OrderPlaced`    | `domain/events/order-placed.event.ts`             | orderId, totalCents, itemCount      |
| `OrderConfirmed` | `domain/events/order-confirmed.event.ts`          | orderId                             |
| `OrderShipped`   | `domain/events/order-shipped.event.ts`            | orderId                             |
| `OrderDelivered` | `domain/events/order-delivered.event.ts`          | orderId                             |
| `OrderCanceled`  | `domain/events/order-canceled.event.ts`           | orderId                             |

### Errors

| Error                    | File                                                    | Factory                         |
|--------------------------|---------------------------------------------------------|---------------------------------|
| `OrderNotFound`          | `domain/errors/order-not-found.error.ts`                | `.create(orderId)`              |
| `InvalidOrderTransition` | `domain/errors/invalid-order-transition.error.ts`      | `.create(from, to)`             |
| `OrderAlreadyCanceled`   | `domain/errors/order-already-canceled.error.ts`         | `.create(orderId)`              |

### Ports

| Port               | File                                                  |
|--------------------|-------------------------------------------------------|
| `IOrderRepository` | `application/ports/order-repository.port.ts`          |

### Use Cases

| Use Case       | File                                                     | Input                    |
|----------------|----------------------------------------------------------|--------------------------|
| `PlaceOrder`   | `application/use-cases/place-order.use-case.ts`         | `PlaceOrderInput`        |
| `ConfirmOrder` | `application/use-cases/confirm-order.use-case.ts`       | `orderId: string`        |
| `ShipOrder`    | `application/use-cases/ship-order.use-case.ts`          | `orderId: string`        |
| `CancelOrder`  | `application/use-cases/cancel-order.use-case.ts`        | `orderId: string`        |
| `GetOrder`     | `application/use-cases/get-order.use-case.ts`           | `orderId: string`        |
| `ListOrders`   | `application/use-cases/list-orders.use-case.ts`         | none                     |

### Contracts

| Symbol              | File                                      |
|---------------------|-------------------------------------------|
| `IOrderService`     | `contracts/orders.contract.ts`            |
| `createOrderService`| `contracts/orders.factory.ts`             |

## Conventions

- `Order` is the aggregate root — all state changes go through `Order` methods
- State machine enforced via `VALID_TRANSITIONS` map in `OrderStatus`
- Valid transitions: pending→confirmed/canceled, confirmed→processing/canceled, processing→shipped/canceled, shipped→delivered, delivered→refunded
- `cancel()` only from pending, confirmed, or processing. Not from shipped/delivered
- `Address` VO: validated but flexible (no country-specific format enforcement)
- All prices in integer cents, no floating point
- ID fields validated on creation (non-empty required)
