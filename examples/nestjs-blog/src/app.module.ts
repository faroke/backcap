import { Module } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Adapters
import { PrismaPostRepository } from "./adapters/persistence/prisma/blog/post-repository.adapter.js";
import { InMemorySearchEngine } from "./adapters/in-memory-search-engine.js";

// NestJS Modules (bridge Backcap Pure DI with NestJS @Injectable DI)
import { BlogModule } from "./adapters/http/nestjs/blog/blog.module.js";
import { SearchModule } from "./adapters/http/nestjs/search/search.module.js";

// Capabilities — factories
import { createSearchService } from "./capabilities/search/contracts/search.factory.js";

// Bridge
import { createBridge } from "./bridges/blog-search/blog-search.bridge.js";

// Shared
import { InMemoryEventBus } from "./shared/in-memory-event-bus.js";

// --- Infrastructure bootstrap (outside NestJS DI) ---
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });
const eventBus = new InMemoryEventBus();

// 1. Wire persistence adapters
const postRepository = new PrismaPostRepository(prisma as never);
const searchEngine = new InMemorySearchEngine();

// 2. Wire search capability
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

// Export for external use
export { prisma };

@Module({
  imports: [
    BlogModule.register({ postRepository, eventBus }),
    SearchModule.register({ searchService }),
  ],
})
export class AppModule {}
