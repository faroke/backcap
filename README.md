# Backcap - POC

Backend Capability Registry for TypeScript

## Overview

Backcap is a revolutionary approach to building backends through composable, framework-agnostic capabilities. Instead of starting from scratch or depending on heavy frameworks, you compose your backend from standardized, tested capabilities.

## Core Concepts

### Capability

A capability is a self-contained backend module that includes:
- Domain entities
- Use cases
- Ports (interfaces)
- Events
- Adapters
- Tests
- AI skills

### Clean Architecture

Every capability follows hexagonal/clean architecture principles:
- Framework-agnostic core
- Port-based abstractions
- Pluggable adapters
- Clear separation of concerns

### AI-Friendly

Each capability includes:
- Structured YAML spec
- AI skills for extensions
- Clear documentation
- Standardized patterns

## Installation

```bash
npm install -g backcap
```

## Quick Start

### 1. Initialize Project

```bash
npx backcap init
```

Choose your preferences:
- Runtime: node, bun, or deno
- Framework: none, nextjs, express, fastify, nestjs
- ORM: prisma, drizzle, or none

### 2. Add Capabilities

```bash
npx backcap add authentication
npx backcap add cart
npx backcap add orders
```

### 3. Generated Structure

```
my-backend/
├── backcap.json
└── capabilities/
    ├── authentication/
    │   ├── spec.yaml
    │   ├── core/
    │   │   └── entities.ts
    │   ├── ports/
    │   │   ├── user-repository.ts
    │   │   └── session-repository.ts
    │   ├── usecases/
    │   │   ├── register.ts
    │   │   ├── login.ts
    │   │   └── logout.ts
    │   ├── events/
    │   │   └── index.ts
    │   ├── adapters/
    │   │   └── user-repository-prisma.ts
    │   ├── tests/
    │   │   └── authentication.test.ts
    │   └── skills/
    │       ├── extend-capability.md
    │       ├── add-usecase.md
    │       └── add-event.md
    └── cart/
        └── ...
```

## Available Capabilities

### Identity
- **authentication** - User authentication with multiple strategies
- **authorization** - Role-based access control

### Data
- **crud-resources** - Generic CRUD operations
- **files** - File upload and storage

### Commerce
- **cart** - Shopping cart management
- **orders** - Order processing and management

### Communication
- **notifications** - Multi-channel notifications

### Infrastructure
- **rate-limiting** - API rate limiting
- **feature-flags** - Feature flag management

## List All Capabilities

```bash
npx backcap list
```

## Capability Structure

### spec.yaml

The specification defines everything about the capability:

```yaml
capability: cart
version: 1.0.0
description: Manage shopping carts
category: commerce

entities:
  Cart:
    id: string
    userId: string
    createdAt: date

  CartItem:
    id: string
    cartId: string
    productId: string
    quantity: number

usecases:
  - createCart
  - addItem
  - removeItem
  - checkout

events:
  - cart.created
  - cart.item_added
  - cart.checked_out

ports:
  - CartRepository
  - ProductCatalog
```

### Core Domain

Pure business logic with no dependencies:

```typescript
// core/entities.ts
export interface Cart {
  id: string;
  userId: string;
  createdAt: Date;
}
```

### Ports

Abstract interfaces for external dependencies:

```typescript
// ports/cart-repository.ts
export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  save(cart: Cart): Promise<Cart>;
  delete(id: string): Promise<void>;
}
```

### Use Cases

Application logic orchestrating the domain:

```typescript
// usecases/add-item.ts
export class AddItem {
  constructor(
    private cartRepo: CartRepository,
    private catalog: ProductCatalog
  ) {}

  async execute(input: AddItemInput): Promise<AddItemOutput> {
    // Implementation
  }
}
```

### Adapters

Concrete implementations for specific technologies:

```typescript
// adapters/cart-repository-prisma.ts
export class PrismaCartRepository implements CartRepository {
  // Prisma-specific implementation
}
```

## AI Skills

Each capability comes with AI skills that help extend and modify it:

### extend-capability
Adds new features while maintaining architecture

### add-usecase
Creates new use cases following existing patterns

### add-event
Adds domain events with proper typing

## Example Projects

### E-commerce Backend

```bash
npx backcap init
npx backcap add authentication
npx backcap add cart
npx backcap add orders
npx backcap add payments
npx backcap add inventory
npx backcap add notifications
```

### SaaS Backend

```bash
npx backcap init
npx backcap add authentication
npx backcap add authorization
npx backcap add organizations
npx backcap add feature-flags
npx backcap add notifications
```

### Simple API

```bash
npx backcap init
npx backcap add authentication
npx backcap add crud-resources
npx backcap add files
npx backcap add rate-limiting
```

## Philosophy

### Composition Over Framework

Instead of being locked into a framework, compose your backend from capabilities.

### Clean Architecture

Every capability is:
- Framework-agnostic
- Testable
- Maintainable
- Extensible

### AI-Native

Built for the AI era:
- Structured specs for easy parsing
- Clear patterns for generation
- Skills for intelligent modifications

### Developer Experience

- Quick initialization
- Standard patterns
- Less boilerplate
- More focus on business logic

## Long-Term Vision

Backcap aims to become "npm for backend capabilities":
- Standard registry
- Community contributions
- Verified capabilities
- Version management
- Dependency resolution

## Technical Details

### TypeScript-First

All capabilities are written in TypeScript with full type safety.

### Runtime Agnostic

Works with Node.js, Bun, or Deno.

### ORM Support

Adapters generated for:
- Prisma
- Drizzle
- Custom implementations

### Framework Integration

Can be integrated with:
- Next.js
- Express
- Fastify
- NestJS
- Or used standalone

## Development

```bash
# Clone repository
git clone https://github.com/yourusername/backcap-poc

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm run dev
```

## Contributing

Contributions welcome! See CONTRIBUTING.md

## License

MIT
