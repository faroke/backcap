---
title: Forms Domain
description: Dynamic form schemas and submissions — create forms, validate and collect structured user input for TypeScript backends.
---

The `forms` domain provides **dynamic form creation, submission validation, and data collection** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add forms
```

## Domain Model

### Form Entity

The `Form` entity is the aggregate root. It holds a list of typed fields and supports adding new fields after creation.

```typescript
import { Form } from "./domains/forms/domain/entities/form.entity";
import { FormField } from "./domains/forms/domain/value-objects/form-field.vo";

const field = FormField.create({ name: "email", type: "email", required: true }).unwrap();
const result = Form.create({ id: crypto.randomUUID(), name: "Contact", fields: [field] });

if (result.isOk()) {
  const form = result.unwrap();
  console.log(form.name, form.fields.length); // "Contact" 1
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Form name |
| `fields` | `FormField[]` | List of form field value objects |
| `createdAt` | `Date` | Timestamp of creation |

A form must have at least one field to be created. `addField(field)` returns a new `Form` instance (immutability).

### FormField Value Object

```typescript
import { FormField } from "./domains/forms/domain/value-objects/form-field.vo";

const field = FormField.create({
  name: "color",
  type: "select",
  required: true,
  options: ["red", "blue", "green"],
});
```

Supported types: `"text"`, `"email"`, `"number"`, `"boolean"`, `"select"`. Select fields require a non-empty `options` array.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `FormNotFound` | No form found for the given ID | `Form not found with id: "<id>"` |
| `FormValidationFailed` | Submission data fails field validation | `Form validation failed: "<details>"` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `FormSubmitted` | `SubmitForm` use case | `formId`, `submissionId`, `occurredAt` |

## Application Layer

### Use Cases

#### CreateForm

Registers a new form with typed fields.

```typescript
const result = await formsService.createForm({
  name: "Contact",
  fields: [
    { name: "email", type: "email", required: true },
    { name: "message", type: "text", required: true },
  ],
});
// Result<{ formId: string; createdAt: Date }, Error>
```

#### SubmitForm

Validates submitted data against the form's field definitions and stores the submission.

```typescript
const result = await formsService.submitForm({
  formId: "form-123",
  data: { email: "user@example.com", message: "Hello!" },
});
// Result<{ submissionId: string; submittedAt: Date }, Error>
```

Validation: required fields must be present, email fields checked with regex, number fields must be finite, select fields checked against options.

#### GetSubmissions

Paginates submissions for a form.

```typescript
const result = await formsService.getSubmissions({
  formId: "form-123",
  limit: 50,
  offset: 0,
});
// Result<{ submissions: Array<...>; total: number }, Error>
```

### Port Interfaces

#### IFormStore

```typescript
export interface IFormStore {
  saveForm(form: Form): Promise<void>;
  findFormById(id: string): Promise<Form | undefined>;
  saveSubmission(formId: string, data: Record<string, unknown>): Promise<{ submissionId: string }>;
  getSubmissions(formId: string, pagination: { limit: number; offset: number }): Promise<{ submissions: Array<...>; total: number }>;
}
```

## Public API (contracts/)

```typescript
import { createFormsService, IFormsService } from "./domains/forms/contracts";

const formsService: IFormsService = createFormsService({ formStore });
```

## Adapters

### forms-prisma

Provides `PrismaFormStore` which implements `IFormStore`.

```bash
npx @backcap/cli add forms-prisma
```

### forms-express

Provides `createFormsRouter(service, router)` for HTTP access.

```bash
npx @backcap/cli add forms-express
```

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/forms` | `{ name, fields }` | `201 { formId, createdAt }` |
| `POST` | `/forms/:id/submit` | `{ ...fieldData }` | `201 { submissionId, submittedAt }` |
| `GET` | `/forms/:id/submissions` | `?limit=&offset=` | `200 { submissions, total }` |

## File Map

```
domains/forms/
  domain/
    entities/form.entity.ts
    value-objects/form-field.vo.ts
    events/form-submitted.event.ts
    errors/form-not-found.error.ts
    errors/form-validation-failed.error.ts
  application/
    use-cases/create-form.use-case.ts
    use-cases/submit-form.use-case.ts
    use-cases/get-submissions.use-case.ts
    ports/form-store.port.ts
    dto/create-form.dto.ts
    dto/submit-form.dto.ts
    dto/get-submissions.dto.ts
  contracts/
    forms.contract.ts
    forms.factory.ts
    index.ts
  shared/
    result.ts
```
