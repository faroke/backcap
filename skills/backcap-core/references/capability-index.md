# Capability Index

This file lists all capabilities and bridges available in the Backcap registry.

---

## Capabilities

| Name | Status | Description | Adapters |
|---|---|---|---|
| `auth` | available | User registration and login with typed domain errors, JWT token service port, password hasher port, and Prisma + Express adapters | `auth-express`, `auth-prisma` |
| `notifications` | planned | Email / SMS / push notification delivery with provider-agnostic port | — |
| `billing` | planned | Subscription and payment management (Stripe-ready) | — |
| `storage` | planned | File upload and retrieval with provider-agnostic port | — |
| `audit-log` | planned | Immutable audit trail for domain events | — |
| `rbac` | planned | Role-based access control with permission checking use cases | — |
| `feature-flags` | planned | Runtime feature toggle evaluation | — |

Install a capability:

```bash
npx @backcap/cli add auth
```

---

## Adapters

Adapters are installed alongside their parent capability. The CLI detects which adapters are
relevant based on the project's detected framework and package manager.

| Name | Parent capability | Framework / ORM | Install command |
|---|---|---|---|
| `auth-express` | `auth` | Express.js | `npx @backcap/cli add auth` (auto-detected) |
| `auth-prisma` | `auth` | Prisma ORM | `npx @backcap/cli add auth` (auto-detected) |

---

## Bridges

Bridges are cross-capability modules. They are unlocked once all their dependency capabilities
are installed.

| Name | Dependencies | Status | Description |
|---|---|---|---|
| `auth-notifications` | `auth` | available | Sends a welcome email when `UserRegistered` is emitted |
| `auth-audit-log` | `auth`, `audit-log` | planned | Records login, registration, and failed-login events to the audit log |
| `billing-notifications` | `billing`, `notifications` | planned | Sends payment receipts and subscription renewal reminders |

List bridges compatible with installed capabilities:

```bash
npx @backcap/cli bridges
```

Install a bridge:

```bash
npx @backcap/cli add bridge auth-notifications
```
