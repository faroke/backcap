import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Adapters
import { PrismaPostRepository } from "./adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";

// Capabilities — factories
import { createBlogService } from "./capabilities/blog/contracts/index.js";
import { createSearchService } from "./capabilities/search/contracts/search.factory.js";

// Bridge
import { createBridge } from "./bridges/blog-search/blog-search.bridge.js";

// Shared
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";

// --- Bootstrap ---

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const eventBus = new InMemoryEventBus();

// 1. Wire adapters
const postRepository = new PrismaPostRepository(prisma as never);
const searchEngine = new InMemorySearchEngine();

// 2. Wire capabilities via factories
const blogService = createBlogService({ postRepository, eventBus });
const searchService = createSearchService({ searchEngine });

// 3. Wire bridge: PostPublished → index in search
const blogSearchBridge = createBridge({
  indexDocument: {
    async execute(input) {
      await searchEngine.indexDocument(input.indexName, input.documentId, input.document);
    },
  },
});
blogSearchBridge.wire(eventBus);

// 4. Create Express app
const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Express Blog Example — powered by Backcap" });
});

// 5. Blog CRUD routes
app.post("/api/posts", async (req, res) => {
  const { title, slug, content, authorId } = req.body as {
    title: string;
    slug?: string;
    content: string;
    authorId: string;
  };
  const result = await blogService.createPost({ title, slug, content, authorId });
  if (result.isFail()) {
    res.status(400).json({ error: result.unwrapError().message });
    return;
  }
  res.status(201).json(result.unwrap());
});

app.put("/api/posts/:id/publish", async (req, res) => {
  const result = await blogService.publishPost({ postId: req.params.id });
  if (result.isFail()) {
    const err = result.unwrapError();
    const status = err.message.includes("not found") ? 404 : 409;
    res.status(status).json({ error: err.message });
    return;
  }
  res.json(result.unwrap());
});

app.get("/api/posts/:id", async (req, res) => {
  const result = await blogService.getPost({ postId: req.params.id });
  if (result.isFail()) {
    res.status(404).json({ error: result.unwrapError().message });
    return;
  }
  res.json(result.unwrap());
});

app.get("/api/posts", async (_req, res) => {
  const result = await blogService.listPosts({});
  if (result.isFail()) {
    res.status(500).json({ error: result.unwrapError().message });
    return;
  }
  res.json(result.unwrap());
});

// 6. Search endpoint
app.get("/api/search", async (req, res) => {
  const query = (req.query.q as string) ?? "";
  const result = await searchService.searchDocuments({
    indexName: "posts",
    query,
    page: 1,
    pageSize: 20,
  });
  if (result.isOk()) {
    res.json(result.unwrap());
  } else {
    res.status(500).json({ error: result.unwrapError().message });
  }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`  Blog API: http://localhost:${PORT}/api/posts`);
  console.log(`  Search:   http://localhost:${PORT}/api/search?q=...`);
});

export { app, prisma };
