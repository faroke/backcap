import { describe, it, expect } from "vitest";
import { InMemoryUserRepository } from "./adapters/in-memory-user-repository.js";
import { SimplePasswordHasher } from "./adapters/simple-password-hasher.js";
import { SimpleTokenService } from "./adapters/simple-token-service.js";
import { InMemoryPostRepository } from "./adapters/in-memory-post-repository.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";
import { InMemoryEventBus } from "./shared/event-bus.js";

describe("Backcap Demo — Full flow", () => {
  it("registers user, creates post, publishes, and finds via search", async () => {
    // Wire adapters
    const userRepo = new InMemoryUserRepository();
    const hasher = new SimplePasswordHasher();
    const tokenService = new SimpleTokenService();
    const postRepo = new InMemoryPostRepository();
    const searchEngine = new InMemorySearchEngine(["posts"]);
    const eventBus = new InMemoryEventBus();

    // Wire blog-search bridge
    eventBus.subscribe<{
      postId: string;
      title: string;
      slug: string;
      authorId: string;
      publishedAt: string;
    }>("PostPublished", async (event) => {
      await searchEngine.indexDocument("posts", event.postId, {
        title: event.title,
        slug: event.slug,
        authorId: event.authorId,
      });
    });

    // 1. Register user
    const userId = "user-1";
    const hash = await hasher.hash("password123");
    await userRepo.save({
      id: userId,
      email: "test@example.com",
      passwordHash: hash,
      roles: ["user"],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await userRepo.findByEmail("test@example.com");
    expect(user).not.toBeNull();
    expect(await hasher.compare("password123", user!.passwordHash)).toBe(true);

    // 2. Login
    const token = await tokenService.sign({ userId });
    const decoded = await tokenService.verify(token);
    expect(decoded.userId).toBe(userId);

    // 3. Create draft post
    const postId = "post-1";
    await postRepo.save({
      id: postId,
      title: "Test Post",
      slug: "test-post",
      content: "Hello world",
      authorId: userId,
      status: "draft",
      createdAt: new Date(),
      publishedAt: null,
    });

    const draft = await postRepo.findById(postId);
    expect(draft!.status).toBe("draft");

    // 4. Publish (triggers bridge)
    const publishedPost = { ...draft!, status: "published" as const, publishedAt: new Date() };
    await postRepo.save(publishedPost);

    await eventBus.publish("PostPublished", {
      postId: draft!.id,
      title: draft!.title,
      slug: draft!.slug,
      authorId: draft!.authorId,
      publishedAt: publishedPost.publishedAt.toISOString(),
    });

    // 5. Search — post should be indexed by bridge
    const results = await searchEngine.search({
      indexName: "posts",
      query: "test",
      page: 1,
      pageSize: 10,
    });

    expect(results.total).toBe(1);
    expect(results.hits[0]!.id).toBe(postId);
    expect((results.hits[0]!.document as { title: string }).title).toBe("Test Post");
  });

  it("lists published posts only", async () => {
    const postRepo = new InMemoryPostRepository();

    await postRepo.save({
      id: "p1",
      title: "Draft",
      slug: "draft",
      content: "...",
      authorId: "u1",
      status: "draft",
      createdAt: new Date(),
      publishedAt: null,
    });
    await postRepo.save({
      id: "p2",
      title: "Published",
      slug: "published",
      content: "...",
      authorId: "u1",
      status: "published",
      createdAt: new Date(),
      publishedAt: new Date(),
    });

    const published = await postRepo.findAll({ status: "published" });
    expect(published).toHaveLength(1);
    expect(published[0]!.title).toBe("Published");
  });

  it("event bus delivers events to subscribers", async () => {
    const bus = new InMemoryEventBus();
    const received: string[] = [];

    bus.subscribe<{ name: string }>("TestEvent", async (event) => {
      received.push(event.name);
    });

    await bus.publish("TestEvent", { name: "hello" });
    await bus.publish("TestEvent", { name: "world" });

    expect(received).toEqual(["hello", "world"]);
  });
});
