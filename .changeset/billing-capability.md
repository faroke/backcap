---
"@backcap/registry": minor
---

Billing capability: vendor-independent payments, subscriptions, and invoicing (story 9.1)

- Domain layer: Customer, Subscription, Invoice, PaymentMethod entities; Money VO (integer cents, no floating-point), BillingPeriod, SubscriptionStatus VOs; 5 domain events; 5 domain errors including InvoiceNotFound
- Application layer: 10 use cases (CreateSubscription, CancelSubscription, ChangeSubscriptionPlan, GetSubscription, ProcessPayment, RefundPayment, GetPaymentHistory, GenerateInvoice, GetInvoice, ListInvoices); 4 ports (IPaymentProvider, ICustomerRepository, ISubscriptionRepository, IInvoiceRepository)
- Contracts: IBillingService with factory wiring
- Prisma adapters: upsert-based save for Customer, Subscription, Invoice repositories
- Express adapter: REST router with input validation, async error handling, correct route ordering
- Safety: provider rollback compensation on CreateSubscription/CancelSubscription failures, currency mismatch guard on plan changes, partial refund validation, month-end date clamping
- 87 tests (55 domain + 25 application + 7 new validation tests)
