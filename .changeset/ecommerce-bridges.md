---
"@backcap/registry": minor
---

feat(registry): e-commerce bridges — catalog-cart, cart-orders, orders-billing, catalog-search (story 10.4)

Four bridges wiring the complete e-commerce flow: catalog → cart → orders → billing.

- **catalog-cart**: DI bridge providing `IProductPriceLookup` — validates product existence, published status, and current variant price via catalog contracts
- **cart-orders**: `CartConverted` → retrieves cart, maps items to `PlaceOrderInput`, places order, publishes `OrderPlaced` on the event bus
- **orders-billing**: `OrderPlaced` → `ProcessPayment` → `ConfirmOrder` (synchronous flow); `PaymentFailed` → publishes `PaymentRetryRequested` for retry handling
- **catalog-search**: `ProductPublished` → fetches product details, indexes in search engine with status guard

30 tests added, all passing. Zero regressions (1200 total).
