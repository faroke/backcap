---
---

feat(registry): complete auth-notifications bridge and add bridge quality validation

- Add auth-notifications bridge with bridge.json manifest and createBridge factory
- Extend quality checks to validate bridge.json required fields (name, sourceCapability, targetCapability, events, version)
- Cross-check bridge.json name against directory name
- Wire bridge quality checks into build pipeline
- Add comprehensive tests with proper cleanup (afterEach + mkdtemp)
