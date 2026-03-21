---
title: Billing Domain
description: Payments, subscriptions, and invoicing with vendor-independent design, Money value object for safe arithmetic, and clean architecture layers for TypeScript backends.
---

The `billing` domain provides **payments, subscriptions, and invoicing** with a vendor-independent architecture. The domain layer uses integer-cents arithmetic via the `Money` value object and has zero knowledge of payment providers like Stripe or Paddle.

## Install

```bash
npx @backcap/cli add billing
```

## Domain Model

### Money Value Object

All monetary amounts use integer cents to avoid floating-point issues.

```typescript
import { Money } from "./domains/billing/domain/value-objects/money.vo";

const price = Money.create(2999, "USD"); // $29.99
const tax = Money.create(450, "USD");    // $4.50

const total = price.unwrap().add(tax.unwrap()); // $34.49
const discounted = total.unwrap().multiply(0.9); // 10% off
```

### Customer Entity

```typescript
import { Customer } from "./domains/billing/domain/entities/customer.entity";

const result = Customer.create({
  id: crypto.randomUUID(),
  email: "user@example.com",
  name: "Jane Doe",
});
```

### Subscription Entity

Subscriptions compose `SubscriptionStatus`, `Money`, and `BillingPeriod` value objects. Mutations are immutable — `cancel()` and `changePlan()` return new instances.

```typescript
import { Subscription } from "./domains/billing/domain/entities/subscription.entity";

const sub = Subscription.create({
  id: crypto.randomUUID(),
  customerId: "cust-1",
  planId: "plan-pro",
  status: "active",
  priceAmount: 2999,
  priceCurrency: "USD",
  billingInterval: "monthly",
  billingStartDate: new Date(),
  billingEndDate: nextMonth,
});

// Immutable cancel
const canceled = sub.unwrap().cancel("user request");
```

### Invoice Entity

```typescript
import { Invoice } from "./domains/billing/domain/entities/invoice.entity";

const invoice = Invoice.create({
  id: crypto.randomUUID(),
  customerId: "cust-1",
  subscriptionId: "sub-1",
  amountValue: 2999,
  amountCurrency: "USD",
  status: "open",
  dueDate: new Date("2026-04-01"),
});

const paid = invoice.unwrap().markPaid();
```

## Use Cases

### Subscription Management

| Use Case | Description |
|----------|-------------|
| `CreateSubscription` | Creates subscription via payment provider, persists to repository |
| `CancelSubscription` | Cancels subscription both locally and with provider |
| `ChangeSubscriptionPlan` | Updates plan and price on active subscription |
| `GetSubscription` | Retrieves subscription by ID |

### Payment Processing

| Use Case | Description |
|----------|-------------|
| `ProcessPayment` | Charges customer via payment provider |
| `RefundPayment` | Refunds full or partial amount |
| `GetPaymentHistory` | Lists customer's invoices |

### Invoice Management

| Use Case | Description |
|----------|-------------|
| `GenerateInvoice` | Creates and persists a new invoice |
| `GetInvoice` | Retrieves invoice by ID |
| `ListInvoices` | Lists all invoices for a customer |

## Ports

The billing domain defines four ports for adapter injection:

- **`IPaymentProvider`** — `createCustomer`, `charge`, `refund`, `createSubscription`, `cancelSubscription`, `attachPaymentMethod`
- **`ICustomerRepository`** — `findById`, `findByEmail`, `save`
- **`ISubscriptionRepository`** — `findById`, `findByCustomerId`, `save`
- **`IInvoiceRepository`** — `findById`, `findByCustomerId`, `save`

## Contract & Factory

Wire everything through the contract factory:

```typescript
import { createBillingService } from "./domains/billing/contracts";

const billing = createBillingService({
  customerRepository: prismaCustomerRepo,
  subscriptionRepository: prismaSubscriptionRepo,
  invoiceRepository: prismaInvoiceRepo,
  paymentProvider: stripeAdapter, // or any IPaymentProvider implementation
});

const result = await billing.createSubscription({
  customerId: "cust-1",
  planId: "plan-pro",
  priceAmount: 2999,
  priceCurrency: "USD",
  billingInterval: "monthly",
});
```

## Domain Events

| Event | Payload |
|-------|---------|
| `SubscriptionCreated` | subscriptionId, customerId, planId |
| `SubscriptionCanceled` | subscriptionId, customerId, reason |
| `PaymentSucceeded` | customerId, amount, currency |
| `PaymentFailed` | customerId, amount, currency, reason |
| `InvoiceGenerated` | invoiceId, customerId, amount, currency |

## Adapters

- **Prisma**: `PrismaCustomerRepository`, `PrismaSubscriptionRepository`, `PrismaInvoiceRepository`
- **Express**: `createBillingRouter(billingService, router)` — REST API for subscriptions, payments, and invoices
- **Stripe**: `StripePaymentProvider` — implements `IPaymentProvider` with Stripe SDK, `StripeWebhookHandler` — handles `payment_intent.succeeded`, `invoice.paid`, `customer.subscription.updated`

### Stripe Adapter

Install the Stripe payment adapter:

```bash
npx @backcap/cli add billing-stripe
```

The Stripe adapter uses hand-typed interfaces so the `stripe` npm package is a peer dependency, not bundled with the registry. Provide a Stripe client instance at construction time:

```typescript
import Stripe from "stripe";
import { StripePaymentProvider } from "./adapters/stripe/billing/stripe-payment-provider.adapter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const paymentProvider = new StripePaymentProvider(stripe);
```

The `StripeWebhookHandler` requires an `IWebhookEventStore` for idempotency (backed by the `StripeWebhookEvent` Prisma model). It uses `findByExternalId` on repository ports to map Stripe IDs to internal domain entities:

```typescript
import { StripeWebhookHandler } from "./adapters/stripe/billing/stripe-webhook-handler";

const webhookHandler = new StripeWebhookHandler(
  customerRepository,
  subscriptionRepository,
  invoiceRepository,
  webhookEventStore,
);

// In your webhook endpoint (after verifying the Stripe signature):
const result = await webhookHandler.handle(event);
```

### Swapping Providers

To use a different payment provider (e.g. Paddle, Braintree), implement `IPaymentProvider` with that provider's SDK. No changes to domain or application layers are needed — just inject the new adapter through the factory.

## Bridges

### auth-billing

When a user registers, automatically create a billing customer profile.

| Source Event | Target Action |
|-------------|---------------|
| `UserRegistered` | `CreateCustomer` — creates a billing customer with the user's ID and email |

```bash
npx @backcap/cli bridges auth-billing
```

### organizations-billing

When an organization is created, create a billing customer scoped to the organization for team billing.

| Source Event | Target Action |
|-------------|---------------|
| `OrganizationCreated` | `CreateCustomer` — creates a billing customer with the organization's ID and name |

```bash
npx @backcap/cli bridges organizations-billing
```
