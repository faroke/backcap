---
title: AI Workflow
description: How to use AI coding assistants effectively with Backcap's architecture.
---

Backcap is designed to work well with AI coding assistants. The strict layer separation, typed interfaces, `Result` monad, and `SKILL.md` files give language models a clear, accurate map of your codebase before they write a single line of code.

## Why Backcap Works Well with AI

**Predictable structure**: Every capability has the same four layers with the same naming conventions. An AI that has read `SKILL.md` once knows where every type of file belongs.

**Typed error handling**: `Result<T, E>` makes failure modes explicit in the type signature. The AI can see exactly what errors a use case returns and generate correct error-handling code.

**Port interfaces as contracts**: Port interfaces define exactly what the AI needs to implement when writing a new adapter. There is no ambiguity about which methods are required.

**Minimal coupling**: Each layer only imports from the layer directly inside it. The AI cannot accidentally suggest an import that violates the architecture — the TypeScript compiler will catch it.

## Loading Skills Before Making Changes

Before making any architectural change to a Backcap project, load the relevant skill files into the AI's context.

### With Claude Code

```
Read the following skill files and use them as context for all
subsequent work in this session:

skills/backcap-core/SKILL.md
skills/backcap-auth/SKILL.md
```

After loading the skills, the AI understands:

- Which layer each type of code belongs in
- Which imports are allowed at each layer
- What `Result<T, E>` is and how to use it
- Which errors each use case can return
- The naming convention for every file type

### Example Prompt: Add a Use Case

```
I've loaded the backcap-core and backcap-auth skills.

Add an updateEmail use case to the auth capability. It should:
- Accept userId and newEmail as inputs
- Find the user by ID (return UserNotFound if not found)
- Call user.updateEmail() (which returns Result<User, InvalidEmail>)
- Save the updated user
- Return Result<void, UserNotFound | InvalidEmail>

Follow the existing patterns in register-user.use-case.ts.
```

The AI will generate a correctly structured use case that:
- Lives in `application/use-cases/update-email.use-case.ts`
- Receives `IUserRepository` via constructor injection
- Returns `Result<void, Error>` rather than throwing
- Has the correct file naming suffix

### Example Prompt: Write an Adapter

```
I've loaded the backcap-core and backcap-auth skills.

Write a Drizzle ORM adapter that implements IUserRepository.
Place it at src/adapters/drizzle/auth/user-repository.adapter.ts.
```

The AI will:
- Import `IUserRepository` from the correct port path
- Implement all three methods: `findByEmail`, `findById`, `save`
- Map between the domain `User` entity and the Drizzle schema type
- Call `User.create().unwrap()` safely (trusting data from the database)

## Generating Bridge Use Cases

Bridges connect two capabilities. Load both relevant skill files:

```
Read backcap-core, backcap-auth, and any notifications skill.

Create an auth-notifications bridge that:
- Listens for UserRegistered events from the auth capability
- Calls an IEmailSender port to send a welcome email
- Returns Result<void, SendWelcomeEmailError>

Model it on the existing auth-notifications bridge pattern.
```

## Extending a Capability

When extending an existing capability, always load the specific skill file for that capability. It contains the domain map — a table of every file, its export, and its responsibility.

```
Load backcap-auth SKILL.md.

Add a UserRole value object that:
- Validates against allowed roles: "user" | "admin" | "moderator"
- Follows the same pattern as email.vo.ts
- Returns Result<UserRole, InvalidRole> from create()
```

## Reviewing AI-Generated Code

Use the architecture rules as a review checklist:

### Domain Layer Check
- [ ] No external imports (only `shared/result.ts` from within the capability)
- [ ] Private constructor with a static `create()` factory
- [ ] Factory returns `Result<T, E>`, not the value directly
- [ ] No async methods

### Application Layer Check
- [ ] Imports only from `domain/` and `application/` within the capability
- [ ] Use case receives port interfaces via constructor (not concrete classes)
- [ ] `execute()` returns `Result<T, E>`
- [ ] No framework-specific code (no `req`, `res`, `prisma`, etc.)

### Contracts Layer Check
- [ ] Only barrel is `contracts/index.ts`
- [ ] Factory function accepts `{ portName: IPortInterface }` deps object
- [ ] Returns the `IService` interface type, not the concrete class

### Adapter Layer Check
- [ ] Class uses the `implements IPortInterface` keyword
- [ ] Imports port from `application/ports/`, entity from `domain/`
- [ ] Does not import from `contracts/`

## Common AI Mistakes to Watch For

**Throwing instead of returning Result:**
```typescript
// Wrong — AI may generate this
async execute(input: RegisterInput) {
  if (existing) throw new UserAlreadyExists(input.email);
}

// Correct
async execute(input: RegisterInput): Promise<Result<{ userId: string }, Error>> {
  if (existing) return Result.fail(UserAlreadyExists.create(input.email));
}
```

**Importing across layers:**
```typescript
// Wrong — importing Prisma into a use case
import { prisma } from "../../lib/prisma";

// Correct — depend on the port interface only
constructor(private readonly userRepository: IUserRepository) {}
```

**Creating barrel exports in wrong places:**
```typescript
// Wrong — index.ts in domain/
// domain/index.ts  <-- do not create this

// Correct — only contracts/ has an index.ts
// contracts/index.ts  <-- this is the only barrel
```

**Mutation instead of returning new instances:**
```typescript
// Wrong — mutating an entity
updateEmail(newEmail: string): void {
  this.email = newEmail; // entities are immutable
}

// Correct — return a new Result<Entity, Error>
updateEmail(newEmail: string): Result<User, InvalidEmail> {
  const emailResult = Email.create(newEmail);
  if (emailResult.isFail()) return Result.fail(emailResult.unwrapError());
  return Result.ok(new User(this.id, emailResult.unwrap(), /* ... */));
}
```

## The llms.txt Files

The Backcap documentation site publishes two files for AI consumption:

- **`/llms.txt`** — a concise (300-500 word) summary of Backcap for use as a system prompt prefix
- **`/llms-full.txt`** — a comprehensive (2000-4000 word) reference covering all capabilities, adapters, and architecture rules

These follow the [llms.txt convention](https://llmstxt.org/) and can be fetched and embedded in AI tool configurations.

```
# Example: embed in Claude's system prompt
curl https://faroke.github.io/backcap/llms.txt
```
