---
name: backcap-users
description: Users domain for Backcap — domain-first clean architecture for user profiles, preferences, and addresses. Provides profile lifecycle management (create, get, update), validated display names, locale (BCP 47 via Intl), timezone (IANA), and avatar URLs, account preferences, and a bounded address book with duplicate-label protection. Persistence is abstracted behind the IProfileRepository port so any database adapter can back it. Use when building user account systems, profile management, internationalization preferences, or address management features.
metadata:
  author: backcap
  version: 0.1.0
---

# Users Domain

## Domain Map

```
domains/users/
├── domain/
│   ├── entities/
│   │   └── profile.entity.ts          → Profile (id, userId, displayName, avatarUrl, bio, locale, timezone, addresses) — immutable, mutations return new instances
│   ├── value-objects/
│   │   ├── display-name.vo.ts         → DisplayName (1-100 chars, trimmed)
│   │   ├── avatar.vo.ts               → Avatar (http(s) URL, max 2048 chars)
│   │   ├── locale.vo.ts               → Locale (BCP 47, canonicalized via Intl.getCanonicalLocales)
│   │   ├── timezone.vo.ts             → Timezone (IANA zone via Intl.supportedValuesOf, plus UTC)
│   │   └── address.vo.ts              → Address (label, street, city, postalCode, country, optional state) with equals()
│   ├── events/
│   │   ├── profile-created.event.ts   → ProfileCreated (profileId, userId, displayName, occurredAt)
│   │   └── profile-updated.event.ts   → ProfileUpdated (profileId, userId, updatedFields, occurredAt)
│   ├── errors/
│   │   ├── profile-not-found.error.ts       → ProfileNotFound
│   │   ├── profile-already-exists.error.ts  → ProfileAlreadyExists
│   │   ├── invalid-display-name.error.ts    → InvalidDisplayName
│   │   ├── invalid-avatar-url.error.ts      → InvalidAvatarUrl
│   │   ├── invalid-bio.error.ts             → InvalidBio
│   │   ├── invalid-locale.error.ts          → InvalidLocale
│   │   ├── invalid-timezone.error.ts        → InvalidTimezone
│   │   └── invalid-address.error.ts         → InvalidAddress
│   └── __tests__/
├── application/
│   ├── use-cases/
│   │   ├── create-profile.use-case.ts    → CreateProfile (rejects duplicates, emits ProfileCreated)
│   │   ├── get-profile.use-case.ts       → GetProfile
│   │   ├── update-profile.use-case.ts    → UpdateProfile (displayName, avatarUrl, bio; emits ProfileUpdated)
│   │   ├── update-preferences.use-case.ts → UpdatePreferences (locale, timezone; emits ProfileUpdated)
│   │   ├── add-address.use-case.ts       → AddAddress
│   │   └── remove-address.use-case.ts    → RemoveAddress
│   ├── ports/
│   │   └── profile-repository.port.ts    → IProfileRepository (findByUserId, findById, save, delete)
│   ├── dto/
│   │   ├── create-profile-input.dto.ts
│   │   ├── update-profile-input.dto.ts
│   │   ├── update-preferences-input.dto.ts
│   │   ├── add-address-input.dto.ts
│   │   └── remove-address-input.dto.ts
│   └── __tests__/
├── contracts/
│   ├── users.contract.ts → IUsersService
│   ├── users.factory.ts  → createUsersService(deps)
│   └── index.ts
└── shared/result.ts          # injected at build time
```

## Key Design Decisions

- **Profiles are immutable**: The `Profile` entity never mutates in place — every change (`updateDisplayName`, `updateAvatar`, `updateBio`, `updatePreferences`, `addAddress`, `removeAddress`) returns a fresh instance with a bumped `updatedAt`.
- **Validated value objects**: Display name (1-100 chars), avatar URL (http(s), ≤2048 chars), locale (canonicalized BCP 47 via `Intl.getCanonicalLocales`), and timezone (IANA via `Intl.supportedValuesOf`) are all parsed into value objects that fail with precise typed errors rather than throwing.
- **Preferences separated from profile fields**: Locale and timezone are managed through a dedicated `UpdatePreferences` use case, distinct from display/avatar/bio updates, so internationalization settings evolve independently.
- **Bounded address book**: A profile holds up to 10 addresses, each identified by a case-insensitive unique label; duplicates and overflow are rejected with `InvalidAddress`.
- **Result type over exceptions**: Every fallible operation returns `Result<Output, E>` with an exact error union (e.g. `ProfileNotFound | InvalidAddress`), giving callers exhaustive, type-checked error handling.
- **Persistence behind a port**: `IProfileRepository` abstracts storage; the domain and use cases have zero knowledge of the underlying database, and `createUsersService(deps)` wires a concrete adapter at the edge.
