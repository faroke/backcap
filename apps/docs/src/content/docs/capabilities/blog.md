---
title: Blog Capability
description: Blog post management for TypeScript backends — coming soon.
---

The `blog` capability will provide blog post management for TypeScript backends. It will follow the same four-layer Clean Architecture used by all Backcap capabilities.

## Status

This capability is on the roadmap. It is not yet available in the registry.

## Planned Features

- Create, update, publish, and delete blog posts
- Draft and published states
- Slug generation and uniqueness enforcement
- Tag associations
- Author references via `userId`
- Pagination-friendly post listing

## Planned Domain Model

### Post Entity

The `Post` entity will be the aggregate root. Planned fields:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `title` | `string` | Post title |
| `slug` | `Slug` | URL-safe identifier (value object) |
| `body` | `string` | Post body content (Markdown) |
| `authorId` | `string` | Reference to the author's user ID |
| `status` | `"draft" \| "published"` | Publication state |
| `tags` | `string[]` | Tag names |
| `publishedAt` | `Date \| null` | Set when the post is published |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last modification timestamp |

### Planned Domain Errors

| Error | Condition |
|---|---|
| `PostNotFound` | Post does not exist for the given ID or slug |
| `SlugAlreadyExists` | A post with the given slug already exists |
| `PostAlreadyPublished` | Attempt to publish an already-published post |
| `InvalidSlug` | Slug fails format validation |

### Planned Use Cases

| Use Case | Description |
|---|---|
| `CreatePost` | Creates a draft post with a unique slug |
| `PublishPost` | Transitions a draft post to published state |
| `UpdatePost` | Updates title, body, or tags |
| `DeletePost` | Removes a post permanently |
| `GetPostBySlug` | Retrieves a published post by slug |
| `ListPosts` | Returns paginated posts filtered by status or tag |

## Planned Adapters

- **blog-prisma**: Prisma adapter implementing `IPostRepository`
- **blog-express**: Express router with CRUD endpoints

## Stay Updated

Watch the [Backcap GitHub repository](https://github.com/backcap/backcap) for progress on the blog capability.

If you need blog functionality today, you can follow the [Create a Capability guide](/guides/create-capability) to build your own using the same patterns.
