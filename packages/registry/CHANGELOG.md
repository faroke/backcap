# @backcap/registry

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
