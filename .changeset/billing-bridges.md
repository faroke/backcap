---
"@backcap/registry": minor
---

Billing bridges: auth-billing and organizations-billing (story 9.3)

- auth-billing bridge: UserRegistered → CreateCustomer with userId, email, derived name (fallback to full email if local part empty)
- organizations-billing bridge: OrganizationCreated → CreateCustomer with orgId, org name, sanitized slug email
- Shared ICreateCustomer contract extracted to billing capability contracts
- Bridges doc table updated with both new bridges
- 8 tests (4 per bridge: happy path, edge case, failure result, exception handling)
