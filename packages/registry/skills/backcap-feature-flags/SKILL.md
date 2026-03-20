---
name: backcap-feature-flags
description: Feature Flags capability for Backcap — toggle features per context without deploys
metadata:
  author: backcap
  version: 0.1.0
---

# Feature Flags Capability

## Domain Map

```
domains/feature-flags/
├── domain/
│   ├── entities/feature-flag.entity.ts    # FeatureFlag — core aggregate with enable()/disable()
│   ├── value-objects/flag-key.vo.ts       # FlagKey — validated lowercase key (2-64 chars)
│   ├── events/flag-toggled.event.ts       # FlagToggled — emitted on toggle
│   └── errors/
│       ├── flag-not-found.error.ts        # FlagNotFound
│       ├── invalid-flag-key.error.ts      # InvalidFlagKey
│       └── flag-already-in-state.error.ts # FlagAlreadyInState
├── application/
│   ├── use-cases/
│   │   ├── evaluate-flag.use-case.ts      # EvaluateFlag — check if a flag is on/off
│   │   ├── create-flag.use-case.ts        # CreateFlag — register a new feature flag
│   │   └── toggle-flag.use-case.ts        # ToggleFlag — switch a flag on/off
│   ├── dto/                               # Input/Output interfaces per use case
│   └── ports/flag-store.port.ts           # IFlagStore — persistence contract
├── contracts/
│   ├── feature-flags.contract.ts          # IFeatureFlagsService
│   ├── feature-flags.factory.ts           # createFeatureFlagsCapability(deps)
│   └── index.ts                           # Barrel exports
└── shared/result.ts                       # Result<T, E> type
```

## Extension Guide

### Adding Percentage Rollout to Conditions

The `conditions` field on `FeatureFlag` is `Record<string, unknown>` by design — opaque to the domain core. To add percentage rollout:

1. Define a condition evaluator outside the domain (e.g., in a bridge or application extension)
2. The evaluator receives `conditions` and `context` from `EvaluateFlagInput`
3. Example condition: `{ percentage: 25, segment: "beta-users" }`
4. The evaluator checks `context.userId` against the percentage hash
5. Override the `isEnabled` boolean based on condition evaluation

This keeps the domain pure while allowing flexible rollout strategies.

## Conventions

- All domain code is pure TypeScript — zero framework imports
- Result<T, E> for all fallible operations
- Private constructors + static `.create()` factories
- Immutable entities — methods return new instances
- Tests co-located in `__tests__/` directories

## Available Adapters

- **Prisma**: `adapters/prisma/feature-flags/prisma-flag-store.ts` — implements IFlagStore
- **Express**: `adapters/express/feature-flags/feature-flags.router.ts` — REST endpoints

## CLI Commands

```bash
backcap add feature-flags       # Install the capability
backcap bridges                 # List available bridges
```
