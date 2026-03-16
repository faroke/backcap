/**
 * Backcap Demo — Auth + Blog + Search with blog-search bridge
 *
 * This demo shows how capabilities compose together using the Backcap architecture:
 *
 * 1. Register a user (auth capability)
 * 2. Create and publish a blog post (blog capability)
 * 3. Blog-search bridge auto-indexes the post when published
 * 4. Search for the post (search capability)
 *
 * All adapters are in-memory for demo purposes.
 * In production, replace with Prisma, Express, Meilisearch, etc.
 */

import { InMemoryUserRepository } from "./adapters/in-memory-user-repository.js";
import { SimplePasswordHasher } from "./adapters/simple-password-hasher.js";
import { SimpleTokenService } from "./adapters/simple-token-service.js";
import { InMemoryPostRepository } from "./adapters/in-memory-post-repository.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";
import { InMemoryEventBus } from "./shared/event-bus.js";

// --- 1. Wire adapters ---
const userRepository = new InMemoryUserRepository();
const passwordHasher = new SimplePasswordHasher();
const tokenService = new SimpleTokenService();
const postRepository = new InMemoryPostRepository();
const searchEngine = new InMemorySearchEngine(["posts"]);
const eventBus = new InMemoryEventBus();

// --- 2. Wire blog-search bridge ---
// When a PostPublished event fires, index the post for search
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
    publishedAt: event.publishedAt,
  });
  console.log(`  [blog-search bridge] Indexed post "${event.title}" in search`);
});

// --- 3. Demo flow ---
async function main() {
  console.log("=== Backcap Demo: Auth + Blog + Search ===\n");

  // Step 1: Register a user
  console.log("1. Registering user...");
  const userId = crypto.randomUUID();
  const email = "author@example.com";
  const hash = await passwordHasher.hash("securepass1");
  await userRepository.save({
    id: userId,
    email,
    passwordHash: hash,
    roles: ["user", "author"],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`   User registered: ${email} (${userId})\n`);

  // Step 2: Login
  console.log("2. Logging in...");
  const user = await userRepository.findByEmail(email);
  if (user && await passwordHasher.compare("securepass1", user.passwordHash)) {
    const token = await tokenService.sign({ userId: user.id });
    console.log(`   Login successful. Token: ${token.slice(0, 20)}...\n`);
  }

  // Step 3: Create a blog post
  console.log("3. Creating blog post...");
  const postId = crypto.randomUUID();
  const slug = "getting-started-with-backcap";
  await postRepository.save({
    id: postId,
    title: "Getting Started with Backcap",
    slug,
    content: "Backcap is a capability registry for TypeScript backends...",
    authorId: userId,
    status: "draft",
    createdAt: new Date(),
    publishedAt: null,
  });
  console.log(`   Draft created: "${slug}"\n`);

  // Step 4: Publish the post (triggers blog-search bridge)
  console.log("4. Publishing post (triggers blog-search bridge)...");
  const post = await postRepository.findById(postId);
  if (post) {
    const publishedPost = { ...post, status: "published" as const, publishedAt: new Date() };
    await postRepository.save(publishedPost);

    // Emit PostPublished event — the bridge picks it up
    await eventBus.publish("PostPublished", {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      authorId: post.authorId,
      publishedAt: publishedPost.publishedAt.toISOString(),
    });
    console.log(`   Post published!\n`);
  }

  // Step 5: Search for the post
  console.log("5. Searching for 'backcap'...");
  const results = await searchEngine.search({
    indexName: "posts",
    query: "backcap",
    page: 1,
    pageSize: 10,
  });
  console.log(`   Found ${results.total} result(s):`);
  for (const hit of results.hits) {
    console.log(`   - [${hit.id}] ${(hit.document as { title: string }).title} (score: ${hit.score})`);
  }

  console.log("\n=== Demo complete ===");
  console.log("\nCapabilities used: auth, blog, search");
  console.log("Bridge used: blog-search (PostPublished → indexDocument)");
}

main().catch(console.error);
