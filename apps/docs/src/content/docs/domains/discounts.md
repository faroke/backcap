---
title: Discounts Domain
description: Promotional campaigns, coupon codes, and discount rules with eligibility conditions, usage limits, and stacking for TypeScript backends.
---

The `discounts` domain provides **promotions, coupon codes, and discount calculations**. It supports percentage and fixed-amount discounts, buy-X-get-Y rules, eligibility conditions, and usage limits.

## Install

```bash
npx @backcap/cli add discounts
```

## Domain Model

### Promotion Entity

A reusable discount campaign with rules, validity period, and stacking configuration.

```typescript
import { Promotion } from "./domains/discounts/domain/entities/promotion.entity";

const promo = Promotion.create({
  id: crypto.randomUUID(),
  name: "Summer Sale",
  status: "draft",
  rules: [{ type: "percentage", value: 15 }],
  conditions: [{ type: "min_order_amount", value: 5000 }],
  validFrom: new Date("2026-06-01"),
  validUntil: new Date("2026-08-31"),
  maxUses: 1000,
  maxUsesPerCustomer: 1,
  stackable: false,
});

const active = promo.unwrap().activate();
```

### CouponCode Entity

Single-use or limited-use codes tied to a promotion.

```typescript
import { CouponCode } from "./domains/discounts/domain/entities/coupon-code.entity";

const coupon = CouponCode.create({
  id: crypto.randomUUID(),
  code: "SUMMER15",
  promotionId: "promo-1",
  maxRedemptions: 100,
  currentRedemptions: 0,
});
```

### Value Objects

- **`PromotionStatus`** — `draft`, `active`, `inactive`
- **`ValidityPeriod`** — start/end date range with active check
- **`UsageLimit`** — max uses globally and per customer
- **`DiscountType`** — percentage, fixed amount, buy-X-get-Y
- **`Money`** — amount with currency for calculations

## Use Cases

| Use Case | Description |
|----------|-------------|
| `CreatePromotion` | Create a discount promotion with rules and conditions |
| `ActivatePromotion` | Set promotion status to active |
| `DeactivatePromotion` | Set promotion status to inactive |
| `GetPromotion` | Retrieve promotion details |
| `ListPromotions` | Query promotions with filters |
| `CreateCoupon` | Generate a coupon code for a promotion |
| `ValidateCoupon` | Check if a coupon code is valid |
| `RedeemCoupon` | Apply a coupon with usage tracking |
| `ApplyDiscount` | Calculate discount for an order context |

## Ports

- **`IPromotionRepository`** — `findById`, `findAll`, `save`
- **`ICouponRepository`** — `findByCode`, `findById`, `save`

## Contract & Factory

```typescript
import { createDiscountsService } from "./domains/discounts/contracts";

const discounts = createDiscountsService({
  promotionRepository: myPromotionRepo,
  couponRepository: myCouponRepo,
});

const result = await discounts.applyDiscount({
  couponCode: "SUMMER15",
  orderAmount: 8999,
  orderCurrency: "USD",
  customerId: "cust-1",
});
```

## Domain Events

| Event | Payload |
|-------|---------|
| `PromotionCreated` | promotionId, name |
| `PromotionActivated` | promotionId |
| `PromotionDeactivated` | promotionId |
| `CouponCreated` | couponId, code, promotionId |
| `CouponRedeemed` | couponId, code, customerId |
