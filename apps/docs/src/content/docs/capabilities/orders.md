---
title: Orders Capability
description: Order lifecycle management for TypeScript backends — state machine-driven order processing from placement through fulfillment.
---

The `orders` capability provides **order lifecycle management** for TypeScript backends. It handles order placement, state machine transitions (pending, confirmed, processing, shipped, delivered, canceled, refunded), address management, and price totals.

## Install

```bash
npx @backcap/cli add orders
```

## Domain Model

### Order Entity

The `Order` entity is the aggregate root. All state transitions go through `Order` methods — `confirm()`, `process()`, `ship()`, `deliver()`, `cancel()`.

```typescript
import { Order } from "./capabilities/orders/domain/entities/order.entity";
import { OrderItem } from "./capabilities/orders/domain/entities/order-item.entity";
import { Address } from "./capabilities/orders/domain/value-objects/address.vo";

const address = Address.create({
  street: "123 Main St",
  city: "Paris",
  country: "France",
  postalCode: "75001",
}).unwrap();

const item = OrderItem.create({
  id: crypto.randomUUID(),
  productId: "prod-123",
  quantity: 2,
  unitPriceCents: 1999,
}).unwrap();

const result = Order.create({
  id: crypto.randomUUID(),
  items: [item],
  shippingAddress: address,
  billingAddress: address,
});

if (result.isOk()) {
  const order = result.unwrap();
  console.log(order.status.value); // "pending"
  console.log(order.totalCents); // 3998
  console.log(order.itemCount); // 1
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `items` | `readonly OrderItem[]` | Order line items |
| `status` | `OrderStatus` | Current order status |
| `shippingAddress` | `Address` | Shipping address |
| `billingAddress` | `Address` | Billing address |
| `totalCents` | `number` | Computed sum of all line totals |
| `itemCount` | `number` | Number of items |

### State Machine

Orders follow a strict state machine enforced by a `VALID_TRANSITIONS` map:

- **pending** &rarr; **confirmed** via `order.confirm()`
- **pending** &rarr; **canceled** via `order.cancel()`
- **confirmed** &rarr; **processing** via `order.process()`
- **confirmed** &rarr; **canceled** via `order.cancel()`
- **processing** &rarr; **shipped** via `order.ship()`
- **processing** &rarr; **canceled** via `order.cancel()`
- **shipped** &rarr; **delivered** via `order.deliver()`
- **delivered** &rarr; **refunded** (future)

Cancellation is only allowed from **pending**, **confirmed**, or **processing** — not from shipped or delivered.

### OrderItem Entity

```typescript
const item = OrderItem.create({
  id: crypto.randomUUID(),
  productId: "prod-123",
  quantity: 2,
  unitPriceCents: 1999,
});

if (item.isOk()) {
  console.log(item.unwrap().lineTotal); // 3998
}
```

## Value Objects

| VO | Description |
|---|---|
| `OrderStatus` | Enum with 7 states and valid transitions map |
| `Address` | Street, city, country, postal code (all required, trimmed) |

## Use Cases

| Use Case | Description |
|---|---|
| `PlaceOrder` | Create a new order with items and addresses |
| `ConfirmOrder` | Transition order to confirmed status |
| `ShipOrder` | Transition order to shipped status (must be processing) |
| `CancelOrder` | Cancel order (only from pending/confirmed/processing) |
| `GetOrder` | Get order with all details |
| `ListOrders` | List all orders |

## Contract

```typescript
import { createOrderService } from "./capabilities/orders/contracts";
import type { IOrderService, OrderOutput } from "./capabilities/orders/contracts";

const orders: IOrderService = createOrderService({
  orderRepository,
});

// Place an order
const result = await orders.placeOrder({
  items: [{ productId: "prod-123", quantity: 2, unitPriceCents: 1999 }],
  shippingAddress: { street: "123 Main", city: "Paris", country: "FR", postalCode: "75001" },
  billingAddress: { street: "123 Main", city: "Paris", country: "FR", postalCode: "75001" },
});

// Lifecycle transitions
await orders.confirmOrder("order-id");
await orders.shipOrder("order-id");
await orders.cancelOrder("order-id");

// Query
const order = await orders.getOrder("order-id");
const all = await orders.listOrders();
```

## Bridges

| Bridge | Source/Target | Description |
|---|---|---|
| `cart-orders` | cart → orders | `CartConverted` → retrieves cart items and places a new order, then publishes `OrderPlaced` |
| `orders-billing` | orders → billing | `OrderPlaced` → processes payment and confirms order; `PaymentFailed` → publishes `PaymentRetryRequested` |

## Ports

| Port | Description |
|---|---|
| `IOrderRepository` | Order persistence (findById, findAll, save, update) |

## Adapters

### Prisma

- `PrismaOrderRepository` — Order and OrderItem persistence with transaction support

### Express

Order routes:

| Method | Route | Description |
|---|---|---|
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/:id` | Get order by ID |
| `POST` | `/orders` | Place a new order |
| `POST` | `/orders/:id/confirm` | Confirm order |
| `POST` | `/orders/:id/ship` | Ship order |
| `POST` | `/orders/:id/cancel` | Cancel order |
