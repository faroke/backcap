---
title: All Features
description: Browse all production-ready backend features available in Backcap — full source code, zero dependency.
---

Browse all production-ready backend features. Each one is independent, well-structured, and designed to work together. Install any feature with a single CLI command.

## Security

| Feature | Description | Install |
|---|---|---|
| [Auth](/backcap/domains/auth) | Sign-up, login, sessions & API keys | `npx @backcap/cli add auth` |
| [RBAC](/backcap/domains/rbac) | Roles, permissions & access control | `npx @backcap/cli add rbac` |
| [Organizations](/backcap/domains/organizations) | Multi-tenant workspaces & teams | `npx @backcap/cli add organizations` |

## Content

| Feature | Description | Install |
|---|---|---|
| [Blog](/backcap/domains/blog) | Posts, categories, drafts & publishing | `npx @backcap/cli add blog` |
| [Comments](/backcap/domains/comments) | Threaded comments & moderation | `npx @backcap/cli add comments` |
| [Tags](/backcap/domains/tags) | Flexible tagging & categorization | `npx @backcap/cli add tags` |
| [Media](/backcap/domains/media) | Image/video processing, thumbnails & CDN URLs | `npx @backcap/cli add media` |
| [Forms](/backcap/domains/forms) | Dynamic form schemas & submissions | `npx @backcap/cli add forms` |

## Commerce

| Feature | Description | Install |
|---|---|---|
| [Billing](/backcap/domains/billing) | Payments, subscriptions & invoicing | `npx @backcap/cli add billing` |
| [Catalog](/backcap/domains/catalog) | Products, variants, categories & pricing | `npx @backcap/cli add catalog` |
| [Cart](/backcap/domains/cart) | Shopping cart with price verification & lifecycle | `npx @backcap/cli add cart` |
| [Orders](/backcap/domains/orders) | Order lifecycle with state machine & fulfillment | `npx @backcap/cli add orders` |

## Infrastructure

| Feature | Description | Install |
|---|---|---|
| [Notifications](/backcap/domains/notifications) | In-app, email & push notifications | `npx @backcap/cli add notifications` |
| [Search](/backcap/domains/search) | Full-text search with filters & facets | `npx @backcap/cli add search` |
| [Files](/backcap/domains/files) | Upload, storage & file management | `npx @backcap/cli add files` |
| [Webhooks](/backcap/domains/webhooks) | Outbound event delivery & retries | `npx @backcap/cli add webhooks` |
| [Queues](/backcap/domains/queues) | Background jobs & task processing | `npx @backcap/cli add queues` |
| [Feature Flags](/backcap/domains/feature-flags) | Toggle features per user or env | `npx @backcap/cli add feature-flags` |
| [Audit Log](/backcap/domains/audit-log) | Track every action in your system | `npx @backcap/cli add audit-log` |
| [Analytics](/backcap/domains/analytics) | Events, metrics & dashboards | `npx @backcap/cli add analytics` |

---

Each feature follows the same clean structure:

```
domains/
  └── <feature>/
       ├── contracts/    ← typed ports & interfaces
       ├── domain/       ← business logic
       └── application/  ← use cases
```

Edit any contract. Swap any layer. [Learn more about the architecture →](/backcap/concepts/architecture)
