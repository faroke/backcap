# @backcap/registry

## 0.7.0

### Minor Changes

- 81aa1a6: feat(registry): media capability — asset management with processing, variant generation, and CDN-aware URL resolution (story 11.1)

## 0.6.0

### Minor Changes

- d42f91f: feat(registry): e-commerce bridges — catalog-cart, cart-orders, orders-billing, catalog-search (story 10.4)

  Four bridges wiring the complete e-commerce flow: catalog → cart → orders → billing.

  - **catalog-cart**: DI bridge providing `IProductPriceLookup` — validates product existence, published status, and current variant price via catalog contracts
  - **cart-orders**: `CartConverted` → retrieves cart, maps items to `PlaceOrderInput`, places order, publishes `OrderPlaced` on the event bus
  - **orders-billing**: `OrderPlaced` → `ProcessPayment` → `ConfirmOrder` (synchronous flow); `PaymentFailed` → publishes `PaymentRetryRequested` for retry handling
  - **catalog-search**: `ProductPublished` → fetches product details, indexes in search engine with status guard

  30 tests added, all passing. Zero regressions (1200 total).

## 0.5.0

### Minor Changes

- 30938c7: feat(registry): orders capability — order lifecycle with state machine, fulfillment tracking (story 10.3)

### Patch Changes

- 4d6552a: fix(registry): cart capability code review fixes — variantId+productId match, domain errors→400, price upper bound, $transaction required, Quantity.max stored, Cart.create validation

## 0.4.0

### Minor Changes

- e81fb1c: feat(registry): cart capability — aggregate-based shopping cart with price verification, quantity validation, currency enforcement, and lifecycle management (story 10.2)

## 0.3.0

### Minor Changes

- feat(registry): catalog capability — products, variants, categories & pricing (story 10.1)

## 0.2.0

### Minor Changes

- 361c159: feat(registry): catalog capability — products, variants, categories and pricing (story 10.1)

## 0.1.0

### Minor Changes

- 16c6f8f: Billing bridges: auth-billing and organizations-billing (story 9.3)

  - auth-billing bridge: UserRegistered → CreateCustomer with userId, email, derived name (fallback to full email if local part empty)
  - organizations-billing bridge: OrganizationCreated → CreateCustomer with orgId, org name, sanitized slug email
  - Shared ICreateCustomer contract extracted to billing capability contracts
  - Bridges doc table updated with both new bridges
  - 8 tests (4 per bridge: happy path, edge case, failure result, exception handling)

- 990b6c8: Billing capability: vendor-independent payments, subscriptions, and invoicing (story 9.1)

  - Domain layer: Customer, Subscription, Invoice, PaymentMethod entities; Money VO (integer cents, no floating-point), BillingPeriod, SubscriptionStatus VOs; 5 domain events; 5 domain errors including InvoiceNotFound
  - Application layer: 10 use cases (CreateSubscription, CancelSubscription, ChangeSubscriptionPlan, GetSubscription, ProcessPayment, RefundPayment, GetPaymentHistory, GenerateInvoice, GetInvoice, ListInvoices); 4 ports (IPaymentProvider, ICustomerRepository, ISubscriptionRepository, IInvoiceRepository)
  - Contracts: IBillingService with factory wiring
  - Prisma adapters: upsert-based save for Customer, Subscription, Invoice repositories
  - Express adapter: REST router with input validation, async error handling, correct route ordering
  - Safety: provider rollback compensation on CreateSubscription/CancelSubscription failures, currency mismatch guard on plan changes, partial refund validation, month-end date clamping
  - 87 tests (55 domain + 25 application + 7 new validation tests)

- 366dff1: Billing Stripe adapter: payment provider, webhook handler with idempotency (story 9.2)

  - StripePaymentProvider implements IPaymentProvider with 6 methods, hand-typed Stripe interfaces (stripe is a peerDependency), error wrapping on all API calls, zero/negative amount guards
  - StripeWebhookHandler processes payment_intent.succeeded, invoice.paid, customer.subscription.updated with real domain logic (markPaid, cancel) and IWebhookEventStore idempotency
  - findByExternalId added to ICustomerRepository and ISubscriptionRepository ports, implemented in Prisma adapters
  - Stripe added to CLI adapter auto-detection (detect-adapters.ts)
  - 23 tests (12 payment provider + 11 webhook handler)

- 8ce116e: Cross-cutting access control: combined auth+permission middleware, tenant-aware tokens, and org-scoped permission checking (story 8.5)

  - `requireAuth()` middleware in auth-rbac bridge combines token validation and permission check in one call
  - Auth tokens now carry optional `organizationId` for tenant-scoped requests
  - `CheckPermission` and `GetUserPermissions` use cases support org-scoped filtering
  - `IAuthorizationService.getUserPermissions()` accepts optional `organizationId`
  - Permission string format validated with clear 400 error on malformed input
