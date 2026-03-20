---
name: backcap-forms
description: Forms capability for Backcap — create forms, submit structured data, and retrieve submissions
metadata:
  author: backcap
  version: 0.1.0
---

# Forms Capability

## Domain Map

```
domains/forms/
├── domain/
│   ├── entities/form.entity.ts               # Form — aggregate with addField()
│   ├── value-objects/form-field.vo.ts         # FormField — typed field with validation (text/email/number/boolean/select)
│   ├── events/form-submitted.event.ts         # FormSubmitted — emitted on submission
│   └── errors/
│       ├── form-not-found.error.ts            # FormNotFound
│       └── form-validation-failed.error.ts    # FormValidationFailed
├── application/
│   ├── use-cases/
│   │   ├── create-form.use-case.ts            # CreateForm — register a new form
│   │   ├── submit-form.use-case.ts            # SubmitForm — validate and store submission
│   │   └── get-submissions.use-case.ts        # GetSubmissions — paginate submissions
│   ├── dto/                                   # Input/Output interfaces per use case
│   └── ports/form-store.port.ts               # IFormStore — persistence contract
├── contracts/
│   ├── forms.contract.ts                      # IFormsService
│   ├── forms.factory.ts                       # createFormsService(deps)
│   └── index.ts                               # Barrel exports
└── shared/result.ts                           # Result<T, E> type
```

## Extension Guide

### Adding a New Field Type

To add a custom field type (e.g., `"date"`, `"url"`):

1. Add the type to the `FormFieldType` union in `form-field.vo.ts`
2. Add validation logic in `SubmitForm` use case's validation switch
3. Update tests for both the VO and the use case
4. The domain entity doesn't change — field types are VO-level concerns

## Conventions

- All domain code is pure TypeScript — zero framework imports
- Form requires at least one field to be created
- `SubmitForm` validates data against form field definitions
- Select fields require non-empty `options` array
- Result<T, E> for all fallible operations

## Available Adapters

- **Prisma**: `adapters/prisma/forms/prisma-form-store.ts` — implements IFormStore
- **Express**: `adapters/express/forms/forms.router.ts` — REST endpoints (POST forms, POST submit, GET submissions)

## CLI Commands

```bash
backcap add forms       # Install the capability
backcap bridges         # List available bridges
```
