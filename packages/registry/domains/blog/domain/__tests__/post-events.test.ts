import { describe, it, expect } from "vitest";
import { PostCreated } from "../events/post-created.event.js";
import { PostPublished } from "../events/post-published.event.js";

describe("PostCreated event", () => {
  it("constructs with explicit occurredAt", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const event = new PostCreated("post-1", "author-1", date);
    expect(event.postId).toBe("post-1");
    expect(event.authorId).toBe("author-1");
    expect(event.occurredAt).toBe(date);
  });

  it("constructs with default occurredAt", () => {
    const before = new Date();
    const event = new PostCreated("post-1", "author-1");
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("has readonly properties", () => {
    const event = new PostCreated("post-1", "author-1");
    expect(event.postId).toBe("post-1");
    expect(event.authorId).toBe("author-1");
  });
});

describe("PostPublished event", () => {
  it("constructs with all fields", () => {
    const publishedAt = new Date("2024-06-01T12:00:00Z");
    const occurredAt = new Date("2024-06-01T12:00:01Z");
    const event = new PostPublished("post-1", "my-post", publishedAt, occurredAt);
    expect(event.postId).toBe("post-1");
    expect(event.slug).toBe("my-post");
    expect(event.publishedAt).toBe(publishedAt);
    expect(event.occurredAt).toBe(occurredAt);
  });

  it("constructs with default occurredAt", () => {
    const publishedAt = new Date();
    const before = new Date();
    const event = new PostPublished("post-1", "my-post", publishedAt);
    const after = new Date();
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("has readonly properties", () => {
    const publishedAt = new Date();
    const event = new PostPublished("post-2", "another-post", publishedAt);
    expect(event.postId).toBe("post-2");
    expect(event.slug).toBe("another-post");
    expect(event.publishedAt).toBe(publishedAt);
  });
});
