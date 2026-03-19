import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Adapters
import { PrismaPostRepository } from "./adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";
import { createBlogRoutes } from "./adapters/http/hono/blog/blog.router.js";

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

// 4. Create Hono app
const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hono Blog Example — powered by Backcap" });
});

// 5. Register blog routes on a sub-app with /api prefix
const api = new Hono();
createBlogRoutes(blogService, api as never);

// 6. Search endpoint
api.get("/search", async (c) => {
  const query = c.req.query("q") ?? "";
  const result = await searchService.searchDocuments({
    indexName: "posts",
    query,
    page: 1,
    pageSize: 20,
  });
  if (result.isOk()) {
    return c.json(result.unwrap());
  }
  return c.json({ error: result.unwrapError().message }, 500);
});

app.route("/api", api);

const PORT = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Hono Blog listening on http://localhost:${info.port}`);
});

export { app, prisma };
