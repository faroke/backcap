import Fastify from "fastify";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Adapters
import { PrismaPostRepository } from "./adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";
import { createBlogPlugin } from "./adapters/http/fastify/blog/blog.router.js";

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

// 4. Create Fastify app
const fastify = Fastify({ logger: true });

fastify.get("/", async () => {
  return { message: "Fastify Blog Example — powered by Backcap" };
});

// 5. Register blog routes as Fastify plugin
await fastify.register(
  async (instance) => {
    await createBlogPlugin(blogService)(instance);
  },
  { prefix: "/api" },
);

// 6. Search endpoint
fastify.get("/api/search", async (request, reply) => {
  const query = (request.query as Record<string, string>).q ?? "";
  const result = await searchService.searchDocuments({
    indexName: "posts",
    query,
    page: 1,
    pageSize: 20,
  });
  if (result.isOk()) {
    return result.unwrap();
  }
  reply.code(500).send({ error: result.unwrapError().message });
});

const PORT = Number(process.env.PORT ?? 3000);
fastify.listen({ port: PORT }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

export { fastify, prisma };
