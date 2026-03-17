---
"@backcap/cli": minor
"@backcap/registry": minor
"@backcap/shared": minor
---

Add cross-capability bridges with event bus pattern

- auth-audit-log bridge subscribes to UserRegistered and LoginSucceeded events
- blog-search bridge now indexes post content field
- blog-comments bridge uses correct SendNotification interface (channel, recipient, subject, body)
- CLI `backcap bridges` reads local bridge.json manifests instead of remote registry
- Registry build generates bridges catalog with sourceCapability, targetCapability, and events
- Shared package exports event-bus, in-memory-event-bus, bridge, and bridge-catalog types
