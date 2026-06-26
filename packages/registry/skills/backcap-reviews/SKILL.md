---
name: backcap-reviews
description: Reviews domain for Backcap — domain-first clean architecture for ratings and text reviews with a moderation workflow. Provides 1–5 star ratings (Rating VO), optional validated text bodies (ReviewBody VO), a pending→approved/rejected moderation lifecycle (ModerationStatus VO), aggregated rating computation from approved reviews only (AggregatedRating VO), duplicate-review prevention per author/resource, and a persistence-agnostic IReviewRepository port. Use when building product/resource reviews, star-rating systems, user-generated feedback with moderation, or aggregated rating displays.
metadata:
  author: backcap
  version: 0.1.0
---

# Reviews Domain

## Domain Map

```
domains/reviews/
├── domain/
│   ├── entities/
│   │   └── review.entity.ts            → Review (id, rating, body?, authorId, resourceId, resourceType, moderationStatus, createdAt, moderatedAt?, moderatorId?); create/approve/reject
│   ├── value-objects/
│   │   ├── rating.vo.ts                → Rating (integer 1–5, else InvalidRating)
│   │   ├── review-body.vo.ts           → ReviewBody (trimmed 1–5000 chars, else InvalidReviewBody)
│   │   ├── moderation-status.vo.ts     → ModerationStatus (pending, approved, rejected)
│   │   └── aggregated-rating.vo.ts     → AggregatedRating (average, count, distribution) computed from a rating distribution
│   ├── events/
│   │   ├── review-submitted.event.ts   → ReviewSubmitted
│   │   └── review-moderated.event.ts   → ReviewModerated
│   ├── errors/
│   │   ├── invalid-rating.error.ts          → InvalidRating
│   │   ├── invalid-review-body.error.ts     → InvalidReviewBody
│   │   ├── duplicate-review.error.ts        → DuplicateReview
│   │   ├── review-not-found.error.ts        → ReviewNotFound
│   │   └── review-already-moderated.error.ts → ReviewAlreadyModerated
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── submit-review.use-case.ts          → SubmitReview
│   │   ├── moderate-review.use-case.ts        → ModerateReview
│   │   ├── get-review.use-case.ts             → GetReview
│   │   ├── list-reviews.use-case.ts           → ListReviews
│   │   └── get-aggregated-rating.use-case.ts  → GetAggregatedRating
│   ├── ports/
│   │   └── review-repository.port.ts   → IReviewRepository (save, findById, findByAuthorAndResource, findByResource, computeRatingDistribution)
│   ├── dto/
│   │   ├── submit-review.dto.ts
│   │   ├── moderate-review.dto.ts
│   │   ├── get-review.dto.ts
│   │   ├── list-reviews.dto.ts
│   │   └── get-aggregated-rating.dto.ts
│   └── __tests__/
├── contracts/
│   ├── reviews.contract.ts → IReviewsService
│   ├── reviews.factory.ts  → createReviewsService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Rating VO**: Only integer values 1–5 are accepted; anything else returns `InvalidRating`. Stars are the single source of truth for aggregated scores.
- **Optional text body**: `ReviewBody` is optional but, when present, is trimmed and validated to 1–5000 characters, returning `InvalidReviewBody` otherwise. A rating without text is valid.
- **Moderation workflow**: Reviews start `pending` and transition once to `approved` or `rejected` via `approve`/`reject`. Re-moderating an already-moderated review returns `ReviewAlreadyModerated`.
- **Aggregated ratings**: `AggregatedRating` is computed from the repository's rating distribution, counting **approved reviews only** so pending/rejected reviews never affect public scores.
- **Duplicate prevention**: `SubmitReview` rejects a second review by the same author for the same resource (`DuplicateReview`) while a prior review is pending or approved; rejected reviews allow resubmission.
- **Result type & ports**: All operations return a `Result<T, E>` (no thrown control flow), and persistence is abstracted behind the `IReviewRepository` port so adapters stay vendor-independent.
