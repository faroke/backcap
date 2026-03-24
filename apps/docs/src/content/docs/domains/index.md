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
| [Forms](/backcap/domains/forms) | Dynamic form schemas & submissions | `npx @backcap/cli add forms` |

## Commerce

| Feature | Description | Install |
|---|---|---|
| [Billing](/backcap/domains/billing) | Payments, subscriptions & invoicing | `npx @backcap/cli add billing` |
| [Catalog](/backcap/domains/catalog) | Products, variants, categories & pricing | `npx @backcap/cli add catalog` |
| [Cart](/backcap/domains/cart) | Shopping cart with price verification & lifecycle | `npx @backcap/cli add cart` |
| [Orders](/backcap/domains/orders) | Order lifecycle with state machine & fulfillment | `npx @backcap/cli add orders` |
| [Inventory](/backcap/domains/inventory) | Stock management, reservations & low-stock alerts | `npx @backcap/cli add inventory` |
| [Discounts](/backcap/domains/discounts) | Promotions, coupons & discount rules | `npx @backcap/cli add discounts` |
| [Shipping](/backcap/domains/shipping) | Shipment lifecycle, tracking & rate calculation | `npx @backcap/cli add shipping` |
| [Reviews](/backcap/domains/reviews) | Customer reviews, moderation & aggregated ratings | `npx @backcap/cli add orders` |

## Social

| Feature | Description | Install |
|---|---|---|
| [Activity](/backcap/domains/activity) | Activity feeds & timelines | `npx @backcap/cli add activity` |
| [Users](/backcap/domains/users) | Profiles, preferences & addresses | `npx @backcap/cli add users` |

## Infrastructure

| Feature | Description | Install |
|---|---|---|
| [Notifications](/backcap/domains/notifications) | In-app, email & push notifications | `npx @backcap/cli add notifications` |
| [Files](/backcap/domains/files) | Upload, storage, file management, image/video processing & variants | `npx @backcap/cli add files` |
| [Audit Log](/backcap/domains/audit-log) | Track every action in your system | `npx @backcap/cli add audit-log` |

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
