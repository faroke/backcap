---
name: backcap-catalog
description: >
  Backcap catalog capability: DDD-structured product catalog for TypeScript backends.
  Domain layer contains Product aggregate (with variants), Category entity, SKU/Money/ProductStatus
  value objects, four domain events (ProductCreated, ProductPublished, ProductArchived, VariantAdded),
  and three typed errors (ProductNotFound, DuplicateSKU, InvalidPrice). Application layer has eight
  use cases (CreateProduct, PublishProduct, AddVariant, UpdatePrice, ListProducts, GetProduct,
  CreateCategory, ListByCategory), plus IProductRepository and ICategoryRepository port interfaces.
  Public surface is ICatalogService and createCatalogService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Adapters: catalog-express (product
  CRUD and category routes), catalog-prisma (PrismaProductRepository, PrismaCategoryRepository).
  Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-catalog

The `catalog` capability provides **product and category management** for TypeScript backends. It is
structured in strict Clean Architecture layers and has zero npm dependencies in the domain and
application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

### Entities

| Entity           | File                                      | Key Fields                                          |
|------------------|-------------------------------------------|-----------------------------------------------------|
| `Product`        | `domain/entities/product.entity.ts`       | id, name, description, status, basePrice, variants  |
| `ProductVariant` | `domain/entities/product-variant.entity.ts`| id, productId, sku, price, attributes               |
| `Category`       | `domain/entities/category.entity.ts`      | id, name, slug, parentId                            |

### Value Objects

| VO              | File                                          | Validation                                     |
|-----------------|-----------------------------------------------|------------------------------------------------|
| `SKU`           | `domain/value-objects/sku.vo.ts`              | 3-50 alphanumeric + hyphens, uppercase         |
| `Money`         | `domain/value-objects/money.vo.ts`            | Integer cents, ISO 4217 currency, arithmetic   |
| `ProductStatus` | `domain/value-objects/product-status.vo.ts`   | draft → active → archived                     |

### Events

| Event              | File                                          | Fields                         |
|--------------------|-----------------------------------------------|--------------------------------|
| `ProductCreated`   | `domain/events/product-created.event.ts`      | productId, name, occurredAt    |
| `ProductPublished` | `domain/events/product-published.event.ts`    | productId, occurredAt          |
| `ProductArchived`  | `domain/events/product-archived.event.ts`     | productId, occurredAt          |
| `VariantAdded`     | `domain/events/variant-added.event.ts`        | productId, variantId, sku      |

### Errors

| Error            | File                                          | Factory                        |
|------------------|-----------------------------------------------|--------------------------------|
| `ProductNotFound`| `domain/errors/product-not-found.error.ts`    | `.create(productId)`           |
| `DuplicateSKU`   | `domain/errors/duplicate-sku.error.ts`        | `.create(sku)`                 |
| `InvalidPrice`   | `domain/errors/invalid-price.error.ts`        | `.create(reason)`              |

### Ports

| Port                 | File                                              |
|----------------------|---------------------------------------------------|
| `IProductRepository` | `application/ports/product-repository.port.ts`    |
| `ICategoryRepository`| `application/ports/category-repository.port.ts`   |

### Use Cases

| Use Case         | File                                                  | Input DTO               |
|------------------|-------------------------------------------------------|-------------------------|
| `CreateProduct`  | `application/use-cases/create-product.use-case.ts`    | `CreateProductInput`    |
| `PublishProduct` | `application/use-cases/publish-product.use-case.ts`   | `productId: string`     |
| `AddVariant`     | `application/use-cases/add-variant.use-case.ts`       | `AddVariantInput`       |
| `UpdatePrice`    | `application/use-cases/update-price.use-case.ts`      | `UpdatePriceInput`      |
| `ListProducts`   | `application/use-cases/list-products.use-case.ts`     | none                    |
| `GetProduct`     | `application/use-cases/get-product.use-case.ts`       | `productId: string`     |
| `CreateCategory` | `application/use-cases/create-category.use-case.ts`   | `CreateCategoryInput`   |
| `ListByCategory` | `application/use-cases/list-by-category.use-case.ts`  | `categoryId: string`    |

### Contracts

| Symbol              | File                                     |
|---------------------|------------------------------------------|
| `ICatalogService`   | `contracts/catalog.contract.ts`          |
| `createCatalogService` | `contracts/catalog.factory.ts`        |

## Conventions

- `Product` is the aggregate root and owns its variants
- `Money` VO is self-contained (not shared with billing)
- `ProductStatus` state machine: draft → active (publish), active → archived (archive). No reverse.
- `addVariant()` enforces no duplicate SKUs within a product
- `Category` hierarchy uses flat `parentId` references
