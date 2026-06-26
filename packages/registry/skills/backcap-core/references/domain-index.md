# Domain Index

This file lists all domains, adapters, and bridges available in the Backcap registry.

---

## Domains

| Name | Status | Description | Adapters |
|---|---|---|---|
| `audit-log` | available | Immutable audit trail for domain events | `prisma`, `express` |
| `auth` | available | User registration, login, sessions with JWT token and password hasher ports | `prisma`, `express` |
| `billing` | available | Subscriptions, payments, invoicing with Stripe adapter | `prisma`, `express`, `stripe` |
| `blog` | available | Posts, categories, drafts, and publishing workflow | `prisma`, `express` |
| `cart` | available | Shopping cart with price verification, quantity validation, and lifecycle | `prisma`, `express` |
| `catalog` | available | Products, variants, categories, and pricing | `prisma`, `express` |
| `comments` | available | Threaded comments and moderation | `prisma`, `express` |
| `files` | available | File upload, storage, and retrieval | `prisma`, `express` |
| `forms` | available | Dynamic form schemas and submissions | `prisma`, `express` |
| `notifications` | available | In-app, email, and push notification delivery | `prisma`, `express` |
| `orders` | available | Order lifecycle with state machine (pending → confirmed → processing → shipped → delivered) | `prisma`, `express` |
| `organizations` | available | Multi-tenant workspaces, teams, invitations, and memberships | `prisma`, `express` |
| `rbac` | available | Roles, permissions, and access control | `prisma`, `express` |
| `tags` | available | Flexible tagging and categorization | `prisma`, `express` |

Install a domain:

```bash
npx @backcap/cli add auth
```

---

## Adapters

Adapters are installed alongside their parent domain. The CLI detects which adapters are
relevant based on the project's detected framework and package manager.

| Type | Domains covered |
|---|---|
| `prisma` | All 14 domains |
| `express` | All 14 domains |
| `stripe` | billing only |

---

## Bridges

Bridges are cross-domain modules. They are unlocked once all their dependency domains
are installed.

| Name | Dependencies | Status | Description |
|---|---|---|---|
| `auth-audit-log` | `auth`, `audit-log` | available | Records login, registration, and failed-login events to the audit log |
| `auth-billing` | `auth`, `billing` | available | Links user accounts to billing customers |
| `auth-notifications` | `auth`, `notifications` | available | Sends a welcome email when `UserRegistered` is emitted |
| `auth-organizations` | `auth`, `organizations` | available | Links user accounts to organization memberships |
| `auth-rbac` | `auth`, `rbac` | available | Auth middleware requiring specific permissions |
| `blog-comments` | `blog`, `comments` | available | Enables comments on blog posts |
| `blog-tags` | `blog`, `tags` | available | Tag support for blog posts |
| `organizations-billing` | `organizations`, `billing` | available | Per-organization billing and subscription management |
| `rbac-organizations` | `rbac`, `organizations` | available | Organization-scoped role assignments |

List bridges compatible with installed domains:

```bash
npx @backcap/cli bridges
```

Install a bridge:

```bash
npx @backcap/cli add bridge auth-notifications
```
