# @backcap/registry

## 0.9.5

### Patch Changes

- c6aaadd: Remove template markers from capability and bridge source files, convert cross-domain imports to @domains/ alias, and update skill references to use new paths.domains config.

## 0.9.4

### Patch Changes

- 404f6c7: Next.js Blog example with stop-and-fix methodology (story 12.5): Next.js App Router adapter for blog capability, working example project, documentation pages.

## 0.9.3

### Patch Changes

- 76ed335: Replace non-functional NestJS code adapter with a wiring guide documenting the DynamicModule.register() pattern. Fix NestJS blog example: add @HttpCode(201) on createPost, add typed error mapping on search controller, add search-bridge test, fix README snippet and FRICTION.md clarity.

## 0.9.2

### Patch Changes

- 4a16362: Hono blog adapter and example with stop-and-fix methodology (story 12.3). Fix registry quality check naming errors in billing, catalog, and orders capabilities.

## 0.9.1

### Patch Changes

- f804c40: Fastify HTTP adapter for blog capability with plugin pattern and JSON schema validation

## 0.9.0

### Minor Changes

- feat: Express blog example with stop-and-fix methodology (story 12.1)

  CLI improvements:

  - Package manager detection now traverses parent directories (monorepo support)
  - Template markers resolved before conflict detection (eliminates false conflicts)
  - Bridge conflict detection uses resolved markers (parity with capabilities)
  - `incomingFiles` recomputed after `capRoot` change in different-path flow
  - New `processTemplateComments` resolves `// Template:` lines during installation
  - New per-file markers: `cap_rel`, `shared_rel`, `bridges_rel` for cross-module imports

  Registry improvements:

  - Blog factory accepts optional `eventBus` — publishes PostCreated/PostPublished automatically
  - IndexDocument use case no longer requires pre-existing index (auto-create)
  - All adapter templates (48 files) updated with `{{cap_rel}}` markers
  - All bridge templates (17 files) updated with `{{shared_rel}}` markers

  Example:

  - Working Express blog in `examples/express-blog/` with blog, search, and blog-search bridge
  - Full CRUD + event-driven search indexing
  - 11 tests (9 blog + 2 bridge)
  - FRICTION.md documents 8 friction points encountered and fixed

## 0.8.0

### Minor Changes

- 49294db: feat(registry): media bridges — blog-media and media-files (story 11.2)

  Two hybrid bridges connecting media to blog and files capabilities:

  - **blog-media**: `MediaDeleted` → cleanup blog post media references (featured images, inline images); `createBlogMediaResolver()` provides `IBlogMediaResolver` wrapping `IMediaService.getMediaUrl()` for blog post media URL resolution
  - **media-files**: `MediaUploaded` → triggers `ProcessMedia` for variant generation; `createFileBackedMediaStorage()` provides `IMediaStorageAdapter` wrapping `IFileStorage` for raw file and variant persistence through the files layer

  17 tests added, all passing. Zero regressions (1281 total).

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
