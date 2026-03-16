---
title: Skills
description: Agent Skills — machine-readable documentation for AI-assisted development.
---

Backcap **Skills** are machine-readable documentation files that make each capability and adapter understandable to AI coding assistants. A skill is a Markdown file with structured frontmatter that describes the module's architecture, contracts, and usage rules in a form optimized for language models.

## What is a Skill?

A skill is a `SKILL.md` file inside a capability or adapter directory. It contains:

- A YAML frontmatter block with a name, description, and metadata
- A prose explanation of the module's purpose and structure
- Tables mapping every file to its exported type and responsibility
- Explicit import rules and naming conventions
- Usage examples and constraint summaries

Skills are located at:

```
packages/registry/
  skills/
    backcap-core/
      SKILL.md          # Architecture rules for all capabilities
      references/
    backcap-auth/
      SKILL.md          # Auth capability detail
      references/
```

## The backcap-core Skill

The `backcap-core` skill describes the global architecture rules that apply to every Backcap capability:

```yaml
---
name: backcap-core
description: >
  Backcap is a DDD capability registry and CLI for TypeScript backends. Each capability follows
  strict Clean Architecture layers: domain (entities, value objects, domain errors, domain events),
  application (use cases, ports as interfaces, DTOs), contracts (public factory + service interface,
  the only barrel index.ts), and adapters (framework/persistence implementations). The Result<T,E>
  monad replaces exceptions for expected failures. Ports define interfaces; adapters implement them.
  Bridges are cross-capability use cases that wire two or more capabilities together.
metadata:
  author: Backcap
  version: 1.0.0
---
```

AI tools that load the `backcap-core` skill understand:

- The four-layer architecture and its import rules
- The `Result<T, E>` monad and when to use it vs. throwing
- File naming conventions (`.entity.ts`, `.vo.ts`, `.port.ts`, etc.)
- The role of bridges and adapters
- How the CLI commands work

## The backcap-auth Skill

The `backcap-auth` skill provides capability-specific detail:

```yaml
---
name: backcap-auth
description: >
  Backcap auth capability: DDD-structured user registration and login for TypeScript backends.
  Domain layer contains User entity, Email and Password value objects, and four typed errors
  (InvalidEmail, InvalidCredentials, UserNotFound, UserAlreadyExists). Application layer has
  RegisterUser and LoginUser use cases, plus IUserRepository, IPasswordHasher, and ITokenService
  port interfaces. Public surface is IAuthService and createAuthService factory in contracts/.
  All expected failures return Result<T,E> — no thrown errors. Adapters: auth-express (router +
  Bearer middleware), auth-prisma (PrismaUserRepository). Bridge: auth-notifications fires
  SendWelcomeEmailUseCase on UserRegistered event. Zero npm dependencies in domain and application.
---
```

This gives an AI assistant enough context to:

- Know which interfaces to implement when writing a custom adapter
- Understand which errors can be returned by each use case
- Generate correct code that follows the existing architectural patterns
- Avoid introducing framework imports into the domain layer

## Using Skills with AI Tools

### Claude Code

When working in a Backcap project, ask Claude to read the relevant skill files before making changes:

```
Read skills/backcap-core/SKILL.md and
skills/backcap-auth/SKILL.md, then help me
add an updatePassword use case to the auth capability.
```

With the skill loaded, the AI understands:

- The `application/` layer is the right place for the new use case
- It must depend only on port interfaces, not on Prisma or bcrypt directly
- It must return `Result<void, Error>`, not throw
- The new port interface (if any) goes in `application/ports/`

### Cursor and Similar Tools

Add the skill files to your AI context window via the `@` include syntax or project context settings. The structured format of skill files is deliberately concise to fit within context limits.

## Skill File Structure

A skill file has three sections:

### 1. Frontmatter

YAML block at the top of the file. Contains `name`, `description` (a single dense paragraph summarizing the module), and `metadata`.

The `description` field is the most important — it is short enough to be embedded directly in a system prompt or tool description.

### 2. Architecture Prose

A narrative explanation of the module. Written for humans but structured to be parseable by machines. Uses consistent section headers and table formats.

### 3. Reference Tables

File-by-file tables listing:

- File path
- Exported name(s)
- Responsibility in one sentence

These tables make it fast for an AI to locate the right file when making a change.

## Creating Skills for Your Own Capabilities

When you [create a new capability](/guides/create-capability), you should create a corresponding `SKILL.md`. The file should:

1. Have a one-paragraph `description` in the YAML frontmatter dense enough to be used as a prompt prefix
2. List every file in a table with its export and responsibility
3. State all import rules explicitly
4. Document what `Result` error types each use case can return
5. Reference the `backcap-core` skill for shared architecture rules

See [backcap-core SKILL.md](https://github.com/backcap/backcap/blob/main/skills/backcap-core/SKILL.md) for a complete example.
