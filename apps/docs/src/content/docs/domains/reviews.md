---
title: Reviews Domain
description: Customer reviews with moderation workflow, 1-5 star ratings, and aggregated rating calculations for TypeScript backends.
---

The `reviews` domain provides **customer reviews, moderation, and aggregated ratings**. It supports 1–5 star ratings, text reviews with validation, and a moderation workflow (pending → approved/rejected).

## Install

```bash
npx @backcap/cli add reviews
```

## Domain Model

### Review Entity

An individual review with rating, body, moderation status, and author reference.

```typescript
import { Review } from "./domains/reviews/domain/entities/review.entity";

const review = Review.create({
  id: crypto.randomUUID(),
  resourceId: "product-42",
  resourceType: "product",
  authorId: "user-1",
  rating: 4,
  body: "Great product, fast shipping!",
  status: "pending",
});

const approved = review.unwrap().approve();
```

### Value Objects

- **`Rating`** — validated 1–5 star integer
- **`ReviewBody`** — text content with length limits
- **`ModerationStatus`** — `pending`, `approved`, `rejected`
- **`AggregatedRating`** — average rating, count, and distribution

## Use Cases

| Use Case | Description |
|----------|-------------|
| `SubmitReview` | Create a new review for a resource |
| `ModerateReview` | Approve or reject a pending review |
| `GetReview` | Retrieve a single review |
| `ListReviews` | Query reviews with filters |
| `GetAggregatedRating` | Get average rating and distribution for a resource |

## Ports

- **`IReviewRepository`** — `findById`, `findByResource`, `save`

## Contract & Factory

```typescript
import { createReviewsService } from "./domains/reviews/contracts";

const reviews = createReviewsService({
  reviewRepository: myReviewRepo,
});

await reviews.submitReview({
  resourceId: "product-42",
  resourceType: "product",
  authorId: "user-1",
  rating: 5,
  body: "Excellent quality!",
});

const stats = await reviews.getAggregatedRating({
  resourceId: "product-42",
  resourceType: "product",
});
// { average: 4.5, count: 12, distribution: { 1: 0, 2: 1, 3: 1, 4: 4, 5: 6 } }
```

## Domain Events

| Event | Payload |
|-------|---------|
| `ReviewSubmitted` | reviewId, resourceId, authorId, rating |
| `ReviewModerated` | reviewId, status, moderatorId |
