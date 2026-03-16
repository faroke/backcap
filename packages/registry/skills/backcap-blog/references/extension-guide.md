# Blog Capability — Extension Guide

Step-by-step instructions for extending the `blog` capability with new use cases, entities,
value objects, and DTOs.

---

## Adding a New Use Case

### Example: `DeletePost`

**Step 1 — Define a DTO**

```typescript
// application/dto/delete-post.dto.ts
export interface DeletePostInput {
  postId: string;
}

export interface DeletePostOutput {
  postId: string;
  deletedAt: Date;
}
```

**Step 2 — Write the use case class**

```typescript
// application/use-cases/delete-post.use-case.ts
import { Result } from '../../shared/result.js';
import { PostNotFound } from '../../domain/errors/post-not-found.error.js';
import type { IPostRepository } from '../ports/post-repository.port.js';
import type { DeletePostInput, DeletePostOutput } from '../dto/delete-post.dto.js';

export class DeletePost {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(input: DeletePostInput): Promise<Result<DeletePostOutput, Error>> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      return Result.fail(PostNotFound.create(input.postId));
    }
    // Add delete method to IPostRepository if needed
    return Result.ok({ postId: input.postId, deletedAt: new Date() });
  }
}
```

**Step 3 — Update the factory and contract**

Add `deletePost` to `IBlogService` and wire it in `createBlogService`.

**Step 4 — Write a test**

```typescript
// application/__tests__/delete-post.use-case.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePost } from '../use-cases/delete-post.use-case.js';
import { InMemoryPostRepository } from './mocks/post-repository.mock.js';
import { createTestPost } from './fixtures/post.fixture.js';
import { PostNotFound } from '../../domain/errors/post-not-found.error.js';

describe('DeletePost use case', () => {
  let postRepo: InMemoryPostRepository;
  let deletePost: DeletePost;

  beforeEach(() => {
    postRepo = new InMemoryPostRepository();
    deletePost = new DeletePost(postRepo);
  });

  it('fails when post does not exist', async () => {
    const result = await deletePost.execute({ postId: 'missing' });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(PostNotFound);
  });
});
```

---

## Adding a New Domain Event

### Example: `PostDeleted`

```typescript
// domain/events/post-deleted.event.ts
export class PostDeleted {
  readonly postId: string;
  readonly authorId: string;
  readonly occurredAt: Date;

  constructor(postId: string, authorId: string, occurredAt?: Date) {
    this.postId = postId;
    this.authorId = authorId;
    this.occurredAt = occurredAt ?? new Date();
  }
}
```

Return it from the use case result payload for callers to forward to bridges or a message bus.

---

## Adding a New Value Object

Follow the same pattern as `Slug`:

- `readonly` properties only.
- `private constructor` + `static create` returning `Result`.
- Validation lives inside `create`.
- No imports outside `domain/` and `shared/result.ts`.
- Co-located test in `domain/__tests__/`.
