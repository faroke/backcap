---
name: backcap-tags
description: Tags capability for Backcap — create tags, tag/untag resources, and list resources by tag
metadata:
  author: backcap
  version: 0.1.0
---

# Tags Capability

## Domain Map

```
capabilities/tags/
├── domain/
│   ├── entities/tag.entity.ts                # Tag — aggregate with auto-slug generation
│   ├── value-objects/tag-slug.vo.ts          # TagSlug — validated kebab-case 1-64 chars, fromName() generator
│   ├── events/tag-created.event.ts           # TagCreated — emitted when tag is created
│   └── errors/
│       ├── tag-not-found.error.ts            # TagNotFound
│       ├── resource-tag-not-found.error.ts   # ResourceTagNotFound
│       ├── tag-already-exists.error.ts      # TagAlreadyExists
│       ├── resource-already-tagged.error.ts # ResourceAlreadyTagged
│       └── invalid-tag-slug.error.ts         # InvalidTagSlug
├── application/
│   ├── use-cases/
│   │   ├── create-tag.use-case.ts            # CreateTag — register a new tag (rejects duplicates)
│   │   ├── tag-resource.use-case.ts          # TagResource — associate tag with resource (rejects if already tagged)
│   │   ├── untag-resource.use-case.ts        # UntagResource — remove association
│   │   └── list-by-tag.use-case.ts           # ListByTag — find resources by tag
│   ├── dto/                                  # Input/Output interfaces per use case
│   └── ports/tag-repository.port.ts          # ITagRepository — persistence contract
├── contracts/
│   ├── tags.contract.ts                      # ITagsService
│   ├── tags.factory.ts                       # createTagsService(deps)
│   └── index.ts                              # Barrel exports
└── shared/result.ts                          # Result<T, E> type
```

## Extension Guide

### Adding Resource Tagging to a New Entity

To tag a new resource type (e.g., "product"):

1. Call `tagResource` with `resourceType: "product"` — no code changes needed
2. The tags system is generic: any `(resourceId, resourceType)` pair works
3. Query tagged products with `listByTag({ tagSlug: "...", resourceType: "product" })`
4. For type safety, consider creating a bridge that wraps the generic tag calls

## Conventions

- All domain code is pure TypeScript — zero framework imports
- `TagSlug.fromName()` auto-generates kebab-case slugs from names
- `ResourceTag` is a junction model — many-to-many between tags and resources
- `UntagResource` verifies the association exists before removing
- Result<T, E> for all fallible operations

## Available Adapters

- **Prisma**: `adapters/prisma/tags/prisma-tag-repository.ts` — implements ITagRepository
- **Express**: `adapters/express/tags/tags.router.ts` — REST endpoints (POST tags, POST/DELETE/GET resources)

## CLI Commands

```bash
backcap add tags       # Install the capability
backcap bridges        # List available bridges
```
