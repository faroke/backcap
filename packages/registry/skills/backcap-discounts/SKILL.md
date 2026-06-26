---
name: backcap-discounts
description: Discounts domain for Backcap — domain-first clean architecture for promotions, coupon codes, and discount calculations. Provides promotion lifecycle management (create, activate, deactivate), coupon code issuance, validation and redemption with usage limits, and a discount engine supporting percentage, fixed-amount, and buy-X-get-Y rules with eligibility conditions and stacking. Use when building promotional campaigns, coupon systems, cart/checkout discount calculation, or any monetization feature that needs rule-based price reductions.
metadata:
  author: backcap
  version: 0.1.0
---

# Discounts Domain

## Domain Map

```
domains/discounts/
├── domain/
│   ├── entities/
│   │   ├── promotion.entity.ts            → Promotion (id, name, status, rules, conditions, validityPeriod, stackable, priority) + activate/deactivate/isEligible/calculateTotalDiscount
│   │   ├── discount-rule.entity.ts        → DiscountRule (type, percentageValue, fixedAmount, buy/getQuantity, maxDiscountAmount) + calculateDiscount
│   │   ├── coupon-code.entity.ts          → CouponCode (code, promotionId, usageLimit, validityPeriod) + isValid/redeem
│   │   └── eligibility-condition.entity.ts → EligibilityCondition (min_order_amount, product_ids, customer_segment, min_item_quantity) + isSatisfiedBy
│   ├── value-objects/
│   │   ├── discount-type.vo.ts            → DiscountType (percentage, fixed_amount, buy_x_get_y)
│   │   ├── money.vo.ts                    → Money (integer cents arithmetic, currency ISO 4217)
│   │   ├── promotion-status.vo.ts         → PromotionStatus (draft, active, inactive, expired)
│   │   ├── usage-limit.vo.ts              → UsageLimit (maxUsesTotal, maxUsesPerCustomer, currentUses) + increment
│   │   └── validity-period.vo.ts          → ValidityPeriod (startDate, endDate) + isActive/hasExpired
│   ├── events/
│   │   ├── promotion-created.event.ts     → PromotionCreated
│   │   ├── promotion-activated.event.ts   → PromotionActivated
│   │   ├── promotion-deactivated.event.ts → PromotionDeactivated
│   │   ├── coupon-created.event.ts        → CouponCreated
│   │   └── coupon-redeemed.event.ts       → CouponRedeemed
│   ├── errors/
│   │   ├── promotion-not-found.error.ts        → PromotionNotFound
│   │   ├── promotion-inactive.error.ts         → PromotionInactive
│   │   ├── invalid-promotion.error.ts          → InvalidPromotion
│   │   ├── invalid-promotion-status.error.ts   → InvalidPromotionStatus
│   │   ├── invalid-promotion-transition.error.ts → InvalidPromotionTransition
│   │   ├── invalid-discount-rule.error.ts      → InvalidDiscountRule
│   │   ├── invalid-discount-type.error.ts      → InvalidDiscountType
│   │   ├── invalid-eligibility-condition.error.ts → InvalidEligibilityCondition
│   │   ├── eligibility-not-met.error.ts        → EligibilityNotMet
│   │   ├── invalid-money.error.ts              → InvalidMoney
│   │   ├── currency-mismatch.error.ts          → CurrencyMismatch
│   │   ├── invalid-validity-period.error.ts    → InvalidValidityPeriod
│   │   ├── invalid-usage-limit.error.ts        → InvalidUsageLimit
│   │   ├── usage-limit-exhausted.error.ts      → UsageLimitExhausted
│   │   ├── invalid-coupon-code.error.ts        → InvalidCouponCode
│   │   ├── coupon-not-found.error.ts           → CouponNotFound
│   │   ├── coupon-expired.error.ts             → CouponExpired
│   │   └── coupon-usage-exceeded.error.ts      → CouponUsageExceeded
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── create-promotion.use-case.ts     → CreatePromotion
│   │   ├── activate-promotion.use-case.ts   → ActivatePromotion
│   │   ├── deactivate-promotion.use-case.ts → DeactivatePromotion
│   │   ├── get-promotion.use-case.ts        → GetPromotion
│   │   ├── list-promotions.use-case.ts      → ListPromotions
│   │   ├── create-coupon.use-case.ts        → CreateCoupon
│   │   ├── validate-coupon.use-case.ts      → ValidateCoupon
│   │   ├── redeem-coupon.use-case.ts        → RedeemCoupon
│   │   └── apply-discount.use-case.ts       → ApplyDiscount (eligibility + stacking engine)
│   ├── ports/
│   │   ├── promotion-repository.port.ts → IPromotionRepository (findById, findAll, findActive, save)
│   │   └── coupon-repository.port.ts    → ICouponRepository (findByCode, save, countUsagesByCustomer, recordUsage)
│   ├── dto/
│   │   ├── create-promotion-input.dto.ts
│   │   ├── create-coupon-input.dto.ts
│   │   ├── redeem-coupon-input.dto.ts
│   │   ├── apply-discount-input.dto.ts
│   │   └── discount-result-output.dto.ts
│   └── __tests__/
├── contracts/
│   ├── discounts.contract.ts → IDiscountsService
│   ├── discounts.factory.ts  → createDiscountsService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Promotion as aggregate root**: A Promotion bundles one or more `DiscountRule`s with `EligibilityCondition`s and a `ValidityPeriod`. State transitions (`activate`/`deactivate`) are guarded by `PromotionStatus` and return new immutable instances via the Result type, failing with `InvalidPromotionTransition`.
- **Three discount types**: `DiscountType` models `percentage` (with optional `maxDiscountAmount` cap), `fixed_amount`, and `buy_x_get_y`. Each `DiscountRule.calculateDiscount` returns a `Money` so amounts stay in integer cents and currency-checked.
- **Coupon codes decoupled from promotions**: `CouponCode` references a `promotionId` and carries its own `UsageLimit` (total + per-customer) and `ValidityPeriod`. Redemption fails precisely with `CouponExpired`, `CouponUsageExceeded`, or `UsageLimitExhausted`.
- **Eligibility & stacking engine**: `ApplyDiscount` collects active, eligible promotions (plus an optional coupon's promotion), then resolves `stackable` vs non-stackable winners by priority and discount amount, capping the total at the order subtotal.
- **Precise typed errors over raw Error**: Every value object, entity, and use case returns `Result<T, E>` with an exact error union (or `Result<T, never>` for never-failing reads like `listPromotions`), so callers exhaustively handle each failure mode at compile time.
