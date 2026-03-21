---
title: Files Domain
description: File upload, retrieval, and deletion for TypeScript backends — domain model, use cases, ports, and adapters.
---

The `files` domain provides **file upload, retrieval, and deletion** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add files
```

## Domain Model

### File Entity

The `File` entity is the aggregate root of the files domain. It holds file metadata including a validated path.

```typescript
import { File } from "./domains/files/domain/entities/file.entity";

const result = File.create({
  id: crypto.randomUUID(),
  name: "photo.jpg",
  path: "uploads/photo.jpg",
  mimeType: "image/jpeg",
  size: 204800,
});

if (result.isOk()) {
  const file = result.unwrap();
  console.log(file.id, file.name, file.path.value, file.size);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `name` | `string` | Original file name |
| `path` | `FilePath` | Validated path value object |
| `mimeType` | `string` | MIME type (e.g. `image/jpeg`) |
| `size` | `number` | File size in bytes (must be a positive integer) |
| `uploadedAt` | `Date` | Timestamp of upload |

`File.create()` returns `Result<File, InvalidFilePath | FileTooLarge>`. Zero-byte files are rejected.

### FilePath Value Object

```typescript
import { FilePath } from "./domains/files/domain/value-objects/file-path.vo";

const result = FilePath.create("uploads/photo.jpg");
// Result<FilePath, InvalidFilePath>

if (result.isOk()) {
  const path = result.unwrap();
  console.log(path.value); // "uploads/photo.jpg"
}
```

Validates: non-empty, no `..` path traversal, matches safe pattern `^[a-zA-Z0-9._\-][a-zA-Z0-9._\-/]*$`.

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `FileNotFound` | No file found for the given ID | `File not found with id: "<id>"` |
| `InvalidFilePath` | Path fails format or traversal validation | `Invalid file path: "<path>"` |
| `FileTooLarge` | File exceeds maximum allowed size | `File size <size> bytes exceeds maximum allowed size of <maxSize> bytes` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `FileUploaded` | `UploadFile` use case | `fileId`, `name`, `mimeType`, `size`, `occurredAt` |

## Application Layer

### Use Cases

#### UploadFile

Creates a new file entity, validates it, persists it, and emits a `FileUploaded` event.

```typescript
import { UploadFile } from "./domains/files/application/use-cases/upload-file.use-case";

const uploadFile = new UploadFile(fileStorage);

const result = await uploadFile.execute({
  name: "photo.jpg",
  path: "uploads/photo.jpg",
  mimeType: "image/jpeg",
  size: 204800,
});
// Result<{ output: { fileId: string }; event: FileUploaded }, Error>
```

**Possible failures**: `InvalidFilePath`, `FileTooLarge`

#### GetFile

Retrieves a file by ID.

```typescript
import { GetFile } from "./domains/files/application/use-cases/get-file.use-case";

const getFile = new GetFile(fileStorage);

const result = await getFile.execute({ fileId: "abc-123" });
// Result<GetFileOutput, FileNotFound>
```

#### DeleteFile

Deletes a file by ID.

```typescript
import { DeleteFile } from "./domains/files/application/use-cases/delete-file.use-case";

const deleteFile = new DeleteFile(fileStorage);

const result = await deleteFile.execute({ fileId: "abc-123" });
// Result<void, FileNotFound>
```

### Port Interfaces

#### IFileStorage

```typescript
export interface IFileStorage {
  save(file: File): Promise<void>;
  findById(fileId: string): Promise<File | null>;
  delete(fileId: string): Promise<void>;
}
```

## Public API (contracts/)

```typescript
import { createFilesService, IFilesService } from "./domains/files/contracts";

const filesService: IFilesService = createFilesService({
  fileStorage,
});

// IFilesService interface:
// upload(input: UploadFileInput): Promise<Result<UploadFileOutput, Error>>
// get(input: GetFileInput): Promise<Result<GetFileOutput, Error>>
// delete(input: DeleteFileInput): Promise<Result<void, Error>>
```

This is the only import consumers need. The internal use case classes are implementation details.

## Adapters

### files-prisma

Provides `PrismaFileStorage` which implements `IFileStorage`.

```bash
npx @backcap/cli add files-prisma
```

```typescript
import { PrismaFileStorage } from "./adapters/prisma/files/prisma-file-storage";

const fileStorage = new PrismaFileStorage(prisma);
```

Requires a Prisma schema with a `FileRecord` model:

```prisma
model FileRecord {
  id         String   @id @default(uuid())
  name       String
  path       String
  mimeType   String
  size       BigInt
  uploadedAt DateTime @default(now())
}
```

### files-express

Provides `createFilesRouter()` with multipart upload support.

```bash
npx @backcap/cli add files-express
```

```typescript
import { createFilesRouter } from "./adapters/express/files/files.router";

const router = express.Router();
createFilesRouter(filesService, router); // works without upload middleware
app.use(router);
```

The `uploadMiddleware` parameter is optional. When provided, it handles multipart parsing on the upload route:

```typescript
import multer from "multer";

const upload = multer({ dest: "uploads/" });
createFilesRouter(filesService, router, upload.single("file"));
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/files` | `multipart/form-data` | `201 { fileId }` or error |
| `GET` | `/files/:id` | — | `200 { id, name, path, ... }` or `404` |
| `DELETE` | `/files/:id` | — | `200 { success }` or `404` |

**HTTP error mapping:**

| Domain Error | HTTP Status |
|---|---|
| `FileNotFound` | `404 Not Found` |
| `FileTooLarge` | `413 Payload Too Large` |
| `InvalidFilePath` | `400 Bad Request` |

## File Map

```
domains/files/
  domain/
    entities/file.entity.ts
    value-objects/file-path.vo.ts
    errors/file-not-found.error.ts
    errors/invalid-file-path.error.ts
    errors/file-too-large.error.ts
    events/file-uploaded.event.ts
  application/
    use-cases/upload-file.use-case.ts
    use-cases/get-file.use-case.ts
    use-cases/delete-file.use-case.ts
    ports/file-storage.port.ts
    dto/upload-file.dto.ts
    dto/get-file.dto.ts
    dto/delete-file.dto.ts
  contracts/
    files.contract.ts
    files.factory.ts
    index.ts
  shared/
    result.ts
```
