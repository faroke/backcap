import { describe, it, expect } from "vitest";
import { CommentPosted } from "../events/comment-posted.event.js";

describe("CommentPosted domain event", () => {
  it("creates an event with default occurredAt", () => {
    const event = new CommentPosted("c-1", "author-1", "post-1", "post");
    expect(event.commentId).toBe("c-1");
    expect(event.authorId).toBe("author-1");
    expect(event.resourceId).toBe("post-1");
    expect(event.resourceType).toBe("post");
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("accepts explicit occurredAt", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const event = new CommentPosted("c-1", "author-1", "post-1", "post", date);
    expect(event.occurredAt).toBe(date);
  });
});
