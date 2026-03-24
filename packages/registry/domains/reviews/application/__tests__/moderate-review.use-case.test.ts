import { describe, it, expect, beforeEach } from "vitest";
import { ModerateReview } from "../use-cases/moderate-review.use-case.js";
import { InMemoryReviewRepository } from "./mocks/in-memory-review-repository.mock.js";
import { createTestReview } from "./fixtures/review.fixture.js";
import { ReviewNotFound } from "../../domain/errors/review-not-found.error.js";
import { ReviewAlreadyModerated } from "../../domain/errors/review-already-moderated.error.js";
import { ReviewModerated } from "../../domain/events/review-moderated.event.js";

describe("ModerateReview", () => {
  let repository: InMemoryReviewRepository;
  let useCase: ModerateReview;

  beforeEach(() => {
    repository = new InMemoryReviewRepository();
    useCase = new ModerateReview(repository);
  });

  it("approves a pending review", async () => {
    const review = createTestReview({ id: "r-1" });
    await repository.save(review);

    const result = await useCase.execute({
      reviewId: "r-1",
      moderatorId: "mod-1",
      decision: "approve",
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.newStatus).toBe("approved");
    expect(output.moderatedAt).toBeInstanceOf(Date);
    expect(event).toBeInstanceOf(ReviewModerated);
    expect(event.newStatus).toBe("approved");
  });

  it("rejects a pending review", async () => {
    const review = createTestReview({ id: "r-1" });
    await repository.save(review);

    const result = await useCase.execute({
      reviewId: "r-1",
      moderatorId: "mod-1",
      decision: "reject",
    });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().output.newStatus).toBe("rejected");
  });

  it("fails with ReviewNotFound for non-existent review", async () => {
    const result = await useCase.execute({
      reviewId: "non-existent",
      moderatorId: "mod-1",
      decision: "approve",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewNotFound);
  });

  it("fails with ReviewAlreadyModerated for already-approved review", async () => {
    const review = createTestReview({ id: "r-1" });
    await repository.save(review);

    await useCase.execute({ reviewId: "r-1", moderatorId: "mod-1", decision: "approve" });

    const result = await useCase.execute({
      reviewId: "r-1",
      moderatorId: "mod-2",
      decision: "approve",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });

  it("fails with ReviewAlreadyModerated for already-rejected review", async () => {
    const review = createTestReview({ id: "r-1" });
    await repository.save(review);

    await useCase.execute({ reviewId: "r-1", moderatorId: "mod-1", decision: "reject" });

    const result = await useCase.execute({
      reviewId: "r-1",
      moderatorId: "mod-2",
      decision: "reject",
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(ReviewAlreadyModerated);
  });
});
