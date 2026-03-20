---
name: backcap-billing
description: Billing capability for Backcap — domain-first clean architecture for payments, subscriptions, and invoicing. Provides vendor-independent payment processing via IPaymentProvider port, subscription lifecycle management (create, cancel, change plan), invoice generation and tracking, and Money value object with safe integer arithmetic. Use when building payment integrations, subscription-based monetization, or invoice management systems.
metadata:
  author: backcap
  version: 0.1.0
---

# Billing Capability

## Domain Map

```
domains/billing/
├── domain/
│   ├── entities/
│   │   ├── customer.entity.ts        → Customer (id, email, name, externalId)
│   │   ├── subscription.entity.ts    → Subscription (id, customerId, planId, status, price, billingPeriod)
│   │   ├── invoice.entity.ts         → Invoice (id, customerId, amount, status, dueDate)
│   │   └── payment-method.entity.ts  → PaymentMethod (id, customerId, type, last4, isDefault)
│   ├── value-objects/
│   │   ├── money.vo.ts               → Money (integer cents arithmetic, currency ISO 4217)
│   │   ├── billing-period.vo.ts      → BillingPeriod (interval, startDate, endDate)
│   │   └── subscription-status.vo.ts → SubscriptionStatus (active, canceled, past_due, trialing, paused, incomplete)
│   ├── events/
│   │   ├── subscription-created.event.ts  → SubscriptionCreated
│   │   ├── subscription-canceled.event.ts → SubscriptionCanceled
│   │   ├── payment-succeeded.event.ts     → PaymentSucceeded
│   │   ├── payment-failed.event.ts        → PaymentFailed
│   │   └── invoice-generated.event.ts     → InvoiceGenerated
│   ├── errors/
│   │   ├── payment-declined.error.ts       → PaymentDeclined
│   │   ├── subscription-not-found.error.ts → SubscriptionNotFound
│   │   ├── invalid-plan.error.ts           → InvalidPlan
│   │   ├── customer-not-found.error.ts     → CustomerNotFound
│   │   └── invoice-not-found.error.ts      → InvoiceNotFound
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── create-subscription.use-case.ts      → CreateSubscription
│   │   ├── cancel-subscription.use-case.ts      → CancelSubscription
│   │   ├── change-subscription-plan.use-case.ts → ChangeSubscriptionPlan
│   │   ├── get-subscription.use-case.ts         → GetSubscription
│   │   ├── process-payment.use-case.ts          → ProcessPayment
│   │   ├── refund-payment.use-case.ts           → RefundPayment
│   │   ├── get-payment-history.use-case.ts      → GetPaymentHistory
│   │   ├── generate-invoice.use-case.ts         → GenerateInvoice
│   │   ├── get-invoice.use-case.ts              → GetInvoice
│   │   └── list-invoices.use-case.ts            → ListInvoices
│   ├── ports/
│   │   ├── payment-provider.port.ts    → IPaymentProvider (createCustomer, charge, refund, createSubscription, cancelSubscription, attachPaymentMethod)
│   │   ├── customer-repository.port.ts → ICustomerRepository
│   │   ├── subscription-repository.port.ts → ISubscriptionRepository
│   │   └── invoice-repository.port.ts  → IInvoiceRepository
│   ├── dto/
│   │   ├── create-subscription-input.dto.ts
│   │   ├── cancel-subscription-input.dto.ts
│   │   ├── change-subscription-plan-input.dto.ts
│   │   ├── process-payment-input.dto.ts
│   │   ├── refund-payment-input.dto.ts
│   │   └── generate-invoice-input.dto.ts
│   └── __tests__/
├── contracts/
│   ├── billing.contract.ts → IBillingService
│   ├── billing.factory.ts  → createBillingService(deps)
│   └── index.ts
└── shared/result.ts
```

## Adapters

```
adapters/prisma/billing/
├── customer-repository.adapter.ts     → PrismaCustomerRepository
├── subscription-repository.adapter.ts → PrismaSubscriptionRepository
└── invoice-repository.adapter.ts      → PrismaInvoiceRepository

adapters/express/billing/
└── billing.router.ts → createBillingRouter(billingService, router)
```

## Key Design Decisions

- **Money VO**: Integer cents arithmetic to avoid floating-point issues. All amounts stored as smallest currency unit.
- **IPaymentProvider**: Core abstraction for payment gateway — Stripe, Paddle, etc. implement this port.
- **Vendor independence**: Domain layer has zero knowledge of payment providers.
- **Immutable entities**: All mutations return new instances via Result type.
