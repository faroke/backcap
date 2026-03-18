# Capability Index

This file lists all capabilities, adapters, and bridges available in the Backcap registry.

---

## Capabilities

| Name | Status | Description | Adapters |
|---|---|---|---|
| `analytics` | available | Event tracking, metrics, and query use cases | `prisma`, `express` |
| `audit-log` | available | Immutable audit trail for domain events | `prisma`, `express` |
| `auth` | available | User registration, login, sessions with JWT token and password hasher ports | `prisma`, `express` |
| `billing` | available | Subscriptions, payments, invoicing with Stripe adapter | `prisma`, `express`, `stripe` |
| `blog` | available | Posts, categories, drafts, and publishing workflow | `prisma`, `express` |
| `cart` | available | Shopping cart with price verification, quantity validation, and lifecycle | `prisma`, `express` |
| `catalog` | available | Products, variants, categories, and pricing | `prisma`, `express` |
| `comments` | available | Threaded comments and moderation | `prisma`, `express` |
| `feature-flags` | available | Runtime feature toggle evaluation per user or environment | `prisma`, `express` |
| `files` | available | File upload, storage, and retrieval | `prisma`, `express` |
| `forms` | available | Dynamic form schemas and submissions | `prisma`, `express` |
| `notifications` | available | In-app, email, and push notification delivery | `prisma`, `express` |
| `orders` | available | Order lifecycle with state machine (pending → confirmed → processing → shipped → delivered) | `prisma`, `express` |
| `organizations` | available | Multi-tenant workspaces, teams, invitations, and memberships | `prisma`, `express` |
| `queues` | available | Background jobs and task processing | `prisma`, `express` |
| `rbac` | available | Roles, permissions, and access control | `prisma`, `express` |
| `search` | available | Full-text search with filters and facets | — |
| `tags` | available | Flexible tagging and categorization | `prisma`, `express` |
| `webhooks` | available | Outbound event delivery with retries | `prisma`, `express` |

Install a capability:

```bash
npx @backcap/cli add auth
```

---

## Adapters

Adapters are installed alongside their parent capability. The CLI detects which adapters are
relevant based on the project's detected framework and package manager.

| Type | Capabilities covered |
|---|---|
| `prisma` | All capabilities except search (18/19) |
| `express` | All capabilities except search (18/19) |
| `stripe` | billing only |

---

## Bridges

Bridges are cross-capability modules. They are unlocked once all their dependency capabilities
are installed.

| Name | Dependencies | Status | Description |
|---|---|---|---|
| `auth-audit-log` | `auth`, `audit-log` | available | Records login, registration, and failed-login events to the audit log |
| `auth-billing` | `auth`, `billing` | available | Links user accounts to billing customers |
| `auth-notifications` | `auth`, `notifications` | available | Sends a welcome email when `UserRegistered` is emitted |
| `auth-organizations` | `auth`, `organizations` | available | Links user accounts to organization memberships |
| `auth-rbac` | `auth`, `rbac` | available | Auth middleware requiring specific permissions |
| `blog-comments` | `blog`, `comments` | available | Enables comments on blog posts |
| `blog-search` | `blog`, `search` | available | Indexes blog posts for full-text search |
| `blog-tags` | `blog`, `tags` | available | Tag support for blog posts |
| `organizations-billing` | `organizations`, `billing` | available | Per-organization billing and subscription management |
| `rbac-organizations` | `rbac`, `organizations` | available | Organization-scoped role assignments |

List bridges compatible with installed capabilities:

```bash
npx @backcap/cli bridges
```

Install a bridge:

```bash
npx @backcap/cli add bridge auth-notifications
```
