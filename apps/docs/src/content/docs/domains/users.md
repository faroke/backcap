---
title: Users Domain
description: User profiles, preferences, and address management with locale, timezone, and validated display names for TypeScript backends.
---

The `users` domain provides **profile management, preferences, and addresses**. It handles display names, avatars, bios, localization settings, and multi-address management.

## Install

```bash
npx @backcap/cli add users
```

## Domain Model

### Profile Entity

A profile holds user identity, preferences, and up to 10 addresses.

```typescript
import { Profile } from "./domains/users/domain/entities/profile.entity";

const profile = Profile.create({
  id: crypto.randomUUID(),
  userId: "user-1",
  displayName: "Jane Doe",
  avatar: "https://example.com/avatar.png",
  bio: "Backend engineer",
  locale: "en",
  timezone: "Europe/Paris",
  addresses: [],
});
```

### Value Objects

- **`DisplayName`** — validated user display name
- **`Avatar`** — validated avatar URL
- **`Locale`** — language/locale preference (e.g. `"en"`, `"fr"`)
- **`Timezone`** — IANA timezone (e.g. `"Europe/Paris"`)
- **`Address`** — label, street, city, postal code, country, state

## Use Cases

| Use Case | Description |
|----------|-------------|
| `CreateProfile` | Initialize a user profile |
| `GetProfile` | Retrieve a profile by user ID |
| `UpdateProfile` | Modify display name, avatar, or bio |
| `UpdatePreferences` | Change locale and timezone |
| `AddAddress` | Add a shipping/contact address (max 10) |
| `RemoveAddress` | Remove an address by label |

## Ports

- **`IProfileRepository`** — `findByUserId`, `save`

## Contract & Factory

```typescript
import { createUsersService } from "./domains/users/contracts";

const users = createUsersService({
  profileRepository: myProfileRepo,
});

await users.createProfile({
  userId: "user-1",
  displayName: "Jane Doe",
  locale: "en",
  timezone: "Europe/Paris",
});
```
