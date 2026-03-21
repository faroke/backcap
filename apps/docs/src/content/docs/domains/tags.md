---
title: Tags Domain
description: Flexible tagging and categorization — create tags, tag/untag any resource, and query resources by tag for TypeScript backends.
---

The `tags` domain provides **flexible resource tagging and categorization** for TypeScript backends. Tag any resource type without coupling, using a generic junction model. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add tags
```

## Domain Model

### Tag Entity

The `Tag` entity is the aggregate root. It auto-generates a slug from the tag name.

```typescript
import { Tag } from "./domains/tags/domain/entities/tag.entity";

const result = Tag.create({ id: crypto.randomUUID(), name: "Web Development" });

if (result.isOk()) {
  const tag = result.unwrap();
  console.log(tag.slug.value); // "web-development"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Human-readable tag name |
| `slug` | `TagSlug` | Auto-generated kebab-case slug |
| `createdAt` | `Date` | Timestamp of creation |

### TagSlug Value Object

```typescript
import { TagSlug } from "./domains/tags/domain/value-objects/tag-slug.vo";

// Create from explicit slug
const result = TagSlug.create("web-development");

// Auto-generate from name
const generated = TagSlug.fromName("Web Development");
// "web-development"
```

Validates: lowercase kebab-case, 1–64 characters, no leading or trailing hyphens. `fromName()` auto-generates a slug from any string.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `TagNotFound` | No tag found for the given slug | `Tag not found with slug: "<slug>"` |
| `TagAlreadyExists` | A tag with the same slug already exists | `Tag already exists with slug: "<slug>"` |
| `ResourceTagNotFound` | Resource is not tagged | `Resource tag not found: tag "<slug>" is not associated with...` |
| `ResourceAlreadyTagged` | Resource is already tagged | `Resource already tagged: tag "<slug>" is already associated with...` |
| `InvalidTagSlug` | Slug fails validation | `Invalid tag slug: "<slug>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `TagCreated` | `CreateTag` use case | `tagId`, `slug`, `occurredAt` |

## Application Layer

### Use Cases

#### CreateTag

Registers a new tag with auto-generated slug. Fails if a tag with the same slug already exists.

```typescript
const result = await tagsService.createTag({ name: "TypeScript" });
// Result<{ tagId: string; slug: string; createdAt: Date }, Error>
```

#### TagResource

Associates a tag with any resource. Fails if the resource is already tagged.

```typescript
const result = await tagsService.tagResource({
  tagSlug: "typescript",
  resourceId: "post-123",
  resourceType: "post",
});
// Result<{ taggedAt: Date }, Error>
```

#### UntagResource

Removes a tag association. Fails if the association doesn't exist.

```typescript
const result = await tagsService.untagResource({
  tagSlug: "typescript",
  resourceId: "post-123",
  resourceType: "post",
});
// Result<{ untaggedAt: Date }, Error>
```

#### ListByTag

Finds resources tagged with a specific tag.

```typescript
const result = await tagsService.listByTag({
  tagSlug: "typescript",
  resourceType: "post", // optional filter
  limit: 50,
  offset: 0,
});
// Result<{ resources: Array<{ resourceId, resourceType, taggedAt }>; total: number }, Error>
```

### Port Interfaces

#### ITagRepository

```typescript
export interface ITagRepository {
  saveTag(tag: Tag): Promise<void>;
  findBySlug(slug: string): Promise<Tag | undefined>;
  tagResource(tagId: string, resourceId: string, resourceType: string): Promise<void>;
  untagResource(tagId: string, resourceId: string, resourceType: string): Promise<void>;
  findResourcesByTag(tagId: string, filters: TagResourceFilters): Promise<{ resources: Array<...>; total: number }>;
  isResourceTagged(tagId: string, resourceId: string, resourceType: string): Promise<boolean>;
}
```

## Public API (contracts/)

```typescript
import { createTagsService, ITagsService } from "./domains/tags/contracts";

const tagsService: ITagsService = createTagsService({ tagRepository });
```

## Adapters

### tags-prisma

Provides `PrismaTagRepository` which implements `ITagRepository`.

```bash
npx @backcap/cli add tags-prisma
```

### tags-express

Provides `createTagsRouter(service, router)` for HTTP access.

```bash
npx @backcap/cli add tags-express
```

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/tags` | `{ name }` | `201 { tagId, slug, createdAt }` / `409` if slug exists |
| `POST` | `/tags/:slug/resources` | `{ resourceId, resourceType }` | `201 { taggedAt }` / `409` if already tagged |
| `DELETE` | `/tags/:slug/resources/:resourceId` | `{ resourceType }` | `200 { untaggedAt }` |
| `GET` | `/tags/:slug/resources` | `?resourceType=&limit=&offset=` | `200 { resources, total }` |

## Bridges

- **blog-tags** — calls `TagResource` when `PostPublished` fires

## File Map

```
domains/tags/
  domain/
    entities/tag.entity.ts
    value-objects/tag-slug.vo.ts
    events/tag-created.event.ts
    errors/tag-not-found.error.ts
    errors/resource-tag-not-found.error.ts
    errors/invalid-tag-slug.error.ts
    errors/tag-already-exists.error.ts
    errors/resource-already-tagged.error.ts
  application/
    use-cases/create-tag.use-case.ts
    use-cases/tag-resource.use-case.ts
    use-cases/untag-resource.use-case.ts
    use-cases/list-by-tag.use-case.ts
    ports/tag-repository.port.ts
    dto/create-tag.dto.ts
    dto/tag-resource.dto.ts
    dto/untag-resource.dto.ts
    dto/list-by-tag.dto.ts
  contracts/
    tags.contract.ts
    tags.factory.ts
    index.ts
  shared/
    result.ts
```
