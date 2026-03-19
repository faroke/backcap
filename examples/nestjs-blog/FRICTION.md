# Friction Log — NestJS Blog Example

## Friction Point 1: NestJS HTTP adapter not yet published

**Step:** `backcap add blog -y`
**Output:** `Could not fetch adapter "blog-nestjs", skipping.`
**Root cause:** The NestJS adapter existed in the registry source (`packages/registry/adapters/nestjs/blog/`) but hadn't been published to the GitHub Pages registry yet. (Note: this adapter was later replaced by a wiring guide at `packages/registry/adapters/nestjs/WIRING-GUIDE.md` — see Story 12.4.1.) The CLI detects NestJS and knows `blog-nestjs` should exist, but cannot fetch it.
**Fix applied:** Manually created the NestJS controller and module in `src/adapters/http/nestjs/blog/`. The adapter will be available after the next registry build + deploy.

## Friction Point 2: Search adapters not published

**Step:** `backcap add search -y`
**Output:** `Could not fetch adapter "search-prisma", skipping.` and `Could not fetch adapter "search-nestjs", skipping.`
**Root cause:** No search adapters exist in the registry yet (Express, Fastify, Hono examples all have the same issue). Search capability is installed, but both adapters are missing.
**Fix applied:** Created `src/adapters/in-memory-search-engine.ts` manually implementing `ISearchEngine` port with simple substring matching. Wired search manually in app.module.ts.

## Friction Point 3: Bridge imports reference non-existent shared paths

**Step:** `backcap add blog-search -y` then `tsc --noEmit`
**Error:** `Cannot find module '../../shared/event-bus.port.js'` and `Cannot find module '../../shared/bridge.js'`
**Root cause:** Bridge files reference `IEventBus` and `Bridge` interfaces with relative paths to `src/shared/`. Before the fix, this directory did not exist — the CLI installs the bridge but doesn't create the shared infrastructure files it depends on.
**Fix applied:** Manually created `src/shared/event-bus.port.ts`, `src/shared/bridge.ts`, and `src/shared/in-memory-event-bus.ts`. After the fix, `src/shared/` exists and all bridge imports resolve correctly.

## Friction Point 4: Prisma client not generated — no schema.prisma

**Step:** Wire app.module.ts then `tsc --noEmit`
**Error:** `Cannot find module './generated/prisma/client.js'`
**Root cause:** The CLI installs a `blog.schema.prisma` fragment file with instructions to copy the model into a main schema. There's no `prisma/schema.prisma` file yet, no generator configured, and no Prisma client generated.
**Fix applied:** Created `prisma/schema.prisma` with generator + datasource config, copied the Post model from the fragment, ran `npx prisma generate`.

## Friction Point 5: Backcap's Pure DI vs NestJS's @Injectable DI

**Step:** Wire Backcap factory inside NestJS module
**Root cause:** Backcap uses Pure DI — `createBlogService({ postRepository, eventBus })` returns a plain object via a factory function. NestJS expects `@Injectable()` classes resolved through its own DI container.

These two DI systems are fundamentally incompatible:
- Backcap: factory function → plain service object (no decorators, no reflection metadata)
- NestJS: decorator-based DI container → `@Injectable()` classes with constructor injection

**Fix applied:** Bridge pattern using NestJS `DynamicModule` with `useFactory` provider:

```typescript
@Module({})
export class BlogModule {
  static register(deps: BlogModuleDeps): DynamicModule {
    return {
      module: BlogModule,
      controllers: [BlogController],
      providers: [
        {
          provide: "IBlogService",
          useFactory: () => createBlogService(deps),
        },
      ],
    };
  }
}
```

The controller receives the service via `@Inject("IBlogService")` string token. NestJS's `useFactory` calls Backcap's factory, and the result is injected as a string-token provider.

**Impact:** This is the highest-friction point across all framework examples. Express, Fastify, and Hono all accept plain functions/objects — NestJS requires explicit DI bridging.

## Friction Point 6: NestJS requires reflect-metadata and decorator config

**Step:** Start server
**Root cause:** NestJS relies on TypeScript decorator metadata for its DI container. This requires:
1. `import "reflect-metadata"` at the application entry point
2. `"emitDecoratorMetadata": true` and `"experimentalDecorators": true` in tsconfig.json

Unlike Express/Fastify/Hono which work with standard TypeScript config, NestJS needs these extra configurations.
**Fix applied:** Added `reflect-metadata` to dependencies, import in `main.ts`, decorator options in `tsconfig.json`.

## Friction Point 7: NestJS error handling differs from other frameworks

**Step:** Implement error responses in controller
**Observation:** Express, Fastify, and Hono adapters all use `toHttpError()` → manual response. NestJS uses exception-based handling — throw `HttpException` and the framework formats the response.
**Fix applied:** NestJS controller throws `new HttpException(error.message, statusCode)` instead of returning error objects.
**Impact:** Not a bug — idiomatic NestJS. Actually cleaner than manual response formatting.

## Friction Point 8: Infrastructure wiring lives outside NestJS DI

**Step:** Bootstrap application in app.module.ts
**Observation:** Prisma client, event bus, repositories, search engine, and bridges are all created as module-level constants outside NestJS's DI container. This is necessary because Backcap's infrastructure uses Pure DI — objects are pre-built then handed to NestJS via `useFactory`.
**Impact:** Expected pattern — Backcap handles composition, NestJS handles HTTP routing.

## Summary

NestJS is the **highest-friction** framework integration. The friction comes from:

1. **DI system clash** (Friction 5) — Pure DI vs @Injectable. Bridged via `DynamicModule` + `useFactory`.
2. **Decorator requirement** (Friction 6) — Extra dependencies and tsconfig options.
3. **Unpublished adapters** (Friction 1, 2) — Same as other frameworks, CLI warns but continues.
4. **Missing shared files** (Friction 3) — Same as other frameworks.

Despite this friction, the integration works well:
- Domain and application layers are identical across all four framework examples
- `DynamicModule.register()` provides a clean bridge pattern
- NestJS's exception-based error handling is actually cleaner than other frameworks

**Conclusion:** A dedicated NestJS adapter category is NOT needed. The `DynamicModule.register()` pattern + wiring guide is sufficient.
