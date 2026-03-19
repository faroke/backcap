import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPostRepository } from "../adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemorySearchEngine } from "../adapters/in-memory-search-engine.js";
import { createBlogService } from "../capabilities/blog/contracts/index.js";
import { createSearchService } from "../capabilities/search/contracts/search.factory.js";
import { createBridge } from "../bridges/blog-search/blog-search.bridge.js";
import { InMemoryEventBus } from "../shared/in-memory-event-bus.js";
import { createBlogRouteHandlers } from "../adapters/http/nextjs/blog/blog.route-handlers.js";

// Serverless-safe singleton pattern: use globalThis to persist across hot reloads in dev
// but allow each cold start to create fresh instances in production

const globalForServices = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  blogHandlers: ReturnType<typeof createBlogRouteHandlers> | undefined;
  searchService: ReturnType<typeof createSearchService> | undefined;
  searchEngine: InMemorySearchEngine | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
  return new PrismaClient({ adapter });
}

const prisma = globalForServices.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForServices.prisma = prisma;
}

function bootstrapServices() {
  const eventBus = new InMemoryEventBus();

  // Adapters
  const postRepository = new PrismaPostRepository(prisma as never);
  const searchEngine = new InMemorySearchEngine();

  // Capabilities
  const blogService = createBlogService({ postRepository, eventBus });
  const searchService = createSearchService({ searchEngine });

  // Bridge: PostPublished → index in search
  const blogSearchBridge = createBridge({
    indexDocument: {
      async execute(input) {
        await searchEngine.indexDocument(input.indexName, input.documentId, input.document);
      },
    },
  });
  blogSearchBridge.wire(eventBus);

  // Route handlers
  const blogHandlers = createBlogRouteHandlers(blogService);

  return { blogHandlers, searchService, searchEngine };
}

function getServices() {
  if (globalForServices.blogHandlers && globalForServices.searchService && globalForServices.searchEngine) {
    return {
      blogHandlers: globalForServices.blogHandlers,
      searchService: globalForServices.searchService,
      searchEngine: globalForServices.searchEngine,
    };
  }

  const services = bootstrapServices();

  if (process.env.NODE_ENV !== "production") {
    globalForServices.blogHandlers = services.blogHandlers;
    globalForServices.searchService = services.searchService;
    globalForServices.searchEngine = services.searchEngine;
  }

  return services;
}

export { getServices, prisma };
