---
title: Catalog Capability
description: Product catalog management for TypeScript backends — products, variants, categories and pricing with Clean Architecture.
---

The `catalog` capability provides **product and category management** for TypeScript backends. It handles product creation, publishing lifecycle, variant management with SKU validation, pricing, and category hierarchies.

## Install

```bash
npx @backcap/cli add catalog
```

## Domain Model

### Product Entity

The `Product` entity is the aggregate root. It owns its variants and enforces business rules (no duplicate SKUs, state machine transitions).

```typescript
import { Product } from "./capabilities/catalog/domain/entities/product.entity";

const result = Product.create({
  id: crypto.randomUUID(),
  name: "Wireless Headphones",
  description: "Premium wireless headphones with noise cancellation",
  basePriceCents: 9999,
});

if (result.isOk()) {
  const product = result.unwrap();
  console.log(product.status.value); // "draft"
  console.log(product.basePrice.cents); // 9999
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Product name |
| `description` | `string` | Product description |
| `status` | `ProductStatus` | draft, active, or archived |
| `basePrice` | `Money` | Base price in integer cents |
| `categoryId` | `string \| null` | Optional category reference |
| `variants` | `ProductVariant[]` | Product variants |

### State Machine

Products follow a strict state machine:

- **draft** → **active** via `product.publish()`
- **active** → **archived** via `product.archive()`
- No reverse transitions

### ProductVariant Entity

```typescript
import { ProductVariant } from "./capabilities/catalog/domain/entities/product-variant.entity";

const variant = ProductVariant.create({
  id: crypto.randomUUID(),
  productId: "prod-123",
  sku: "WH-BLK-L",
  priceCents: 10999,
  attributes: { color: "black", size: "L" },
});
```

### Category Entity

Categories support hierarchy via flat `parentId` references.

```typescript
import { Category } from "./capabilities/catalog/domain/entities/category.entity";

const category = Category.create({
  id: crypto.randomUUID(),
  name: "Electronics",
  slug: "electronics",
  parentId: null, // root category
});
```

## Value Objects

| VO | Description |
|---|---|
| `SKU` | Validated alphanumeric format (3-50 chars), auto-uppercased |
| `Money` | Integer cents with ISO 4217 currency, `add()`, `subtract()`, `multiply()` |
| `ProductStatus` | Enum: `draft`, `active`, `archived` with state machine |

## Use Cases

| Use Case | Description |
|---|---|
| `CreateProduct` | Create a new draft product |
| `PublishProduct` | Transition product from draft to active |
| `AddVariant` | Add a variant with SKU validation |
| `UpdatePrice` | Update product base price |
| `ListProducts` | List all products |
| `GetProduct` | Get a single product by ID |
| `CreateCategory` | Create a category with unique slug |
| `ListByCategory` | List products in a category |

## Contract

```typescript
import { createCatalogService } from "./capabilities/catalog/contracts";
import type { ICatalogService } from "./capabilities/catalog/contracts";

const catalog: ICatalogService = createCatalogService({
  productRepository,
  categoryRepository,
});

// Create a product
const result = await catalog.createProduct({
  name: "Widget",
  description: "A great widget",
  basePriceCents: 1999,
});
```

## Adapters

### Prisma

- `PrismaProductRepository` — Product and ProductVariant persistence
- `PrismaCategoryRepository` — Category persistence

### Express

Product and category routes:

| Method | Route | Description |
|---|---|---|
| `POST` | `/products` | Create product |
| `GET` | `/products` | List products |
| `GET` | `/products/:id` | Get product |
| `POST` | `/products/:id/publish` | Publish product |
| `POST` | `/products/:id/variants` | Add variant |
| `PUT` | `/products/:id/price` | Update price |
| `POST` | `/categories` | Create category |
| `GET` | `/categories/:id/products` | List products by category |
