---
"@backcap/registry": minor
"@backcap/cli": patch
---

Billing Stripe adapter: payment provider, webhook handler with idempotency (story 9.2)

- StripePaymentProvider implements IPaymentProvider with 6 methods, hand-typed Stripe interfaces (stripe is a peerDependency), error wrapping on all API calls, zero/negative amount guards
- StripeWebhookHandler processes payment_intent.succeeded, invoice.paid, customer.subscription.updated with real domain logic (markPaid, cancel) and IWebhookEventStore idempotency
- findByExternalId added to ICustomerRepository and ISubscriptionRepository ports, implemented in Prisma adapters
- Stripe added to CLI adapter auto-detection (detect-adapters.ts)
- 23 tests (12 payment provider + 11 webhook handler)
