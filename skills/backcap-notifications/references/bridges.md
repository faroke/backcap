# Notifications Capability — Bridges Reference

---

## `auth-notifications`

**Status**: available

**Source**: auth | **Target**: notifications

**Events**: `UserRegistered`

**Purpose**: Sends a welcome email when a new user registers.

### How It Works

The bridge listens for `UserRegistered` events and calls `SendWelcomeEmailUseCase` which
uses the `IEmailSender` port to deliver the email.

---

## `blog-comments`

**Status**: available

**Source**: comments | **Target**: blog, notifications

**Events**: `CommentPosted`

**Purpose**: Sends a notification to the blog post author when someone comments on their post.

### How It Works

1. Receives `CommentPosted` event via the event bus.
2. If `resourceType === "post"`, looks up the post author via `getPost`.
3. Calls `sendNotification.execute({ channel: "email", recipient: post.authorId, subject: "New comment on your post", body: "..." })`.
4. If the post is not found (deleted), silently no-ops.

### Wiring

```typescript
import { createBridge } from './bridges/blog-comments/blog-comments.bridge.js';

const bridge = createBridge({
  getPost: blogService.getPost,
  sendNotification: notificationService.sendNotification,
});
bridge.wire(eventBus);
```
