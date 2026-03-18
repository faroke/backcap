---
title: Cart Capability
description: Shopping cart management for TypeScript backends — aggregate-based domain logic with price calculations, quantity validation, and lifecycle management.
---

The `cart` capability provides **shopping cart management** for TypeScript backends. It handles item management, price verification at add time, quantity validation, total calculation, currency enforcement, and cart lifecycle (active → abandoned/converted).

## Install

```bash
npx @backcap/cli add cart
```

## Domain Model

### Cart Entity

The `Cart` entity is the aggregate root. All item operations go through `Cart` methods — never directly on `CartItem`. Each cart has a single currency enforced across all items.

```typescript
import { Cart } from "./capabilities/cart/domain/entities/cart.entity";

const result = Cart.create({
  id: crypto.randomUUID(),
  userId: "user-123",
  currency: "USD", // all items must match
});

if (result.isOk()) {
  const cart = result.unwrap();
  console.log(cart.status.value); // "active"
  console.log(cart.totalCents); // 0
  console.log(cart.itemCount); // 0
  console.log(cart.currency); // "USD"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `userId` | `string \| null` | Optional user reference |
| `status` | `CartStatus` | active, abandoned, or converted |
| `items` | `readonly CartItem[]` | Cart items |
| `totalCents` | `number` | Computed sum of all line totals |
| `maxItems` | `number` | Maximum items allowed (default 50) |
| `currency` | `string` | ISO 4217 currency code (default USD) |

### Adding Items

When adding an item with the same `variantId`, quantities are merged and price is updated to the latest value:

```typescript
const updated = cart.addItem({
  id: crypto.randomUUID(),
  productId: "prod-123",
  variantId: "var-456",
  quantity: 2,
  unitPriceCents: 1999,
});

if (updated.isOk()) {
  console.log(updated.unwrap().totalCents); // 3998
}
```

Adding an item with a different currency than the cart's will be rejected.

### State Machine

Carts follow a strict state machine:

- **active** → **abandoned** via `cart.abandon()`
- **active** → **converted** via `cart.convert()`
- No reverse transitions
- Items can only be added/removed/cleared on active carts

### CartItem Entity

```typescript
import { CartItem } from "./capabilities/cart/domain/entities/cart-item.entity";

const item = CartItem.create({
  id: crypto.randomUUID(),
  productId: "prod-123",
  variantId: "var-456",
  quantity: 2,
  unitPriceCents: 1999,
  currency: "USD",
});

if (item.isOk()) {
  console.log(item.unwrap().lineTotal); // 3998
}
```

## Value Objects

| VO | Description |
|---|---|
| `Quantity` | Positive integer with configurable max (default 99) |
| `CartStatus` | Enum: `active`, `abandoned`, `converted` with state machine |

## Use Cases

| Use Case | Description |
|---|---|
| `AddToCart` | Add item with price verification via `IProductPriceLookup` |
| `RemoveFromCart` | Remove item by variant ID |
| `UpdateQuantity` | Update item quantity |
| `GetCart` | Get cart with all items and totals |
| `ClearCart` | Remove all items from cart |
| `AbandonCart` | Transition cart to abandoned status |
| `ConvertCart` | Transition cart to converted status |

## Contract

```typescript
import { createCartService } from "./capabilities/cart/contracts";
import type { ICartService, CartOutput } from "./capabilities/cart/contracts";

const cart: ICartService = createCartService({
  cartRepository,
  productPriceLookup,
});

// Add item to cart
await cart.addToCart({
  cartId: "cart-123",
  productId: "prod-456",
  variantId: "var-789",
  quantity: 2,
});

// Get cart
const result = await cart.getCart("cart-123");

// Lifecycle transitions
await cart.abandonCart("cart-123");
await cart.convertCart("cart-123");
```

## Ports

| Port | Description |
|---|---|
| `ICartRepository` | Cart persistence (findById, findByUserId, save, update) |
| `IProductPriceLookup` | Price verification at add time — prevents stale price attacks |

The `IProductPriceLookup` port is satisfied by the catalog capability's contract when both are installed (via bridge).

## Adapters

### Prisma

- `PrismaCartRepository` — Cart and CartItem persistence with transaction support

### Express

Cart routes:

| Method | Route | Description |
|---|---|---|
| `GET` | `/carts/:id` | Get cart |
| `POST` | `/carts/:id/items` | Add item to cart |
| `DELETE` | `/carts/:id/items/:variantId` | Remove item |
| `PUT` | `/carts/:id/items/:variantId/quantity` | Update quantity |
| `POST` | `/carts/:id/clear` | Clear all items |
| `POST` | `/carts/:id/abandon` | Mark cart as abandoned |
| `POST` | `/carts/:id/convert` | Mark cart as converted |
