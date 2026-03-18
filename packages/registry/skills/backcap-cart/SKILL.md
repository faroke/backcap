---
name: backcap-cart
description: >
  Backcap cart capability: DDD-structured shopping cart for TypeScript backends.
  Domain layer contains Cart aggregate root (with items, totals, status, single-currency enforcement),
  CartItem entity, Quantity and CartStatus value objects, four domain events (ItemAddedToCart,
  ItemRemovedFromCart, CartAbandoned, CartConverted), and four typed errors (CartNotFound, ItemNotInCart,
  CartLimitExceeded, InvalidQuantity). Application layer has seven use cases (AddToCart, RemoveFromCart,
  UpdateQuantity, GetCart, ClearCart, AbandonCart, ConvertCart), plus ICartRepository and
  IProductPriceLookup port interfaces. Public surface is ICartService and createCartService factory
  in contracts/. All expected failures return Result<T,E> — no thrown errors.
  Adapters: cart-express (cart CRUD + lifecycle routes), cart-prisma (PrismaCartRepository).
  Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-cart

The `cart` capability provides **shopping cart management** for TypeScript backends. It is
structured in strict Clean Architecture layers and has zero npm dependencies in the domain and
application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

### Entities

| Entity     | File                                   | Key Fields                                              |
|------------|----------------------------------------|---------------------------------------------------------|
| `Cart`     | `domain/entities/cart.entity.ts`       | id, userId, status, items, totalCents, maxItems, currency |
| `CartItem` | `domain/entities/cart-item.entity.ts`  | id, productId, variantId, quantity, unitPriceCents, currency |

### Value Objects

| VO           | File                                        | Validation                                    |
|--------------|---------------------------------------------|-----------------------------------------------|
| `Quantity`   | `domain/value-objects/quantity.vo.ts`       | Positive integer, configurable max (default 99)|
| `CartStatus` | `domain/value-objects/cart-status.vo.ts`    | active, abandoned, converted                  |

### Events

| Event               | File                                              | Fields                              |
|---------------------|---------------------------------------------------|-------------------------------------|
| `ItemAddedToCart`   | `domain/events/item-added-to-cart.event.ts`       | cartId, variantId, quantity (total) |
| `ItemRemovedFromCart`| `domain/events/item-removed-from-cart.event.ts`  | cartId, variantId                   |
| `CartAbandoned`     | `domain/events/cart-abandoned.event.ts`           | cartId                              |
| `CartConverted`     | `domain/events/cart-converted.event.ts`           | cartId                              |

### Errors

| Error              | File                                              | Factory                         |
|--------------------|---------------------------------------------------|---------------------------------|
| `CartNotFound`     | `domain/errors/cart-not-found.error.ts`           | `.create(cartId)`               |
| `ItemNotInCart`    | `domain/errors/item-not-in-cart.error.ts`         | `.create(variantId)`            |
| `CartLimitExceeded`| `domain/errors/cart-limit-exceeded.error.ts`      | `.create(maxItems)`             |
| `InvalidQuantity`  | `domain/errors/invalid-quantity.error.ts`         | `.create(reason)`               |

### Ports

| Port                  | File                                                  |
|-----------------------|-------------------------------------------------------|
| `ICartRepository`     | `application/ports/cart-repository.port.ts`           |
| `IProductPriceLookup` | `application/ports/product-price-lookup.port.ts`      |

### Use Cases

| Use Case        | File                                                    | Input DTO              |
|-----------------|---------------------------------------------------------|------------------------|
| `AddToCart`     | `application/use-cases/add-to-cart.use-case.ts`        | `AddToCartInput`       |
| `RemoveFromCart`| `application/use-cases/remove-from-cart.use-case.ts`   | `RemoveFromCartInput`  |
| `UpdateQuantity`| `application/use-cases/update-quantity.use-case.ts`    | `UpdateQuantityInput`  |
| `GetCart`       | `application/use-cases/get-cart.use-case.ts`           | `cartId: string`       |
| `ClearCart`     | `application/use-cases/clear-cart.use-case.ts`         | `cartId: string`       |
| `AbandonCart`   | `application/use-cases/abandon-cart.use-case.ts`       | `cartId: string`       |
| `ConvertCart`   | `application/use-cases/convert-cart.use-case.ts`       | `cartId: string`       |

### Contracts

| Symbol             | File                                     |
|--------------------|------------------------------------------|
| `ICartService`     | `contracts/cart.contract.ts`             |
| `createCartService`| `contracts/cart.factory.ts`              |

## Conventions

- `Cart` is the aggregate root — all item operations go through `Cart` methods
- Each cart enforces a single currency (ISO 4217); items with mismatched currency are rejected
- `addItem()` merges quantities if same variantId exists, and updates the price to the latest value
- `IProductPriceLookup` port verifies current price at add time (prevents stale prices)
- `Quantity` VO: positive integer only, configurable max (default 99)
- Cart state machine: active → abandoned (abandon), active → converted (convert). No reverse.
- Max items limit is configurable per cart (default 50), must be ≥ 1
- ID fields are validated on creation (non-empty required)
