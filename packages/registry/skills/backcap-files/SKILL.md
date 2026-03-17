---
name: backcap-files
description: >
  Backcap files capability: DDD-structured file upload, retrieval, and deletion for TypeScript
  backends. Domain layer contains File entity, FilePath value object, FileUploaded event, and
  three typed errors (FileNotFound, InvalidFilePath, FileTooLarge). Application layer has
  UploadFile, GetFile, and DeleteFile use cases, plus IFileStorage port interface. Public surface
  is IFilesService and createFilesService factory in contracts/. All expected failures return
  Result<T,E> — no thrown errors. Adapters: files-express (router with multipart upload support),
  files-prisma (PrismaFileStorage). Zero npm dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-files

The `files` capability provides **file upload, retrieval, and deletion** for TypeScript backends.
It is structured in strict Clean Architecture layers and has zero npm dependencies in the domain
and application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

See [`references/domain-map.md`](references/domain-map.md) for a full file-by-file reference.

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/file.entity.ts` | `File` | Aggregate root. Holds `id`, `name`, `path: FilePath`, `mimeType`, `size`, `uploadedAt`. Private constructor; factory via `File.create(params)` returning `Result<File, InvalidFilePath \| FileTooLarge>`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/file-path.vo.ts` | `FilePath` | Validates path against safe pattern (`^[\w\-./]+$`), rejects `..` traversal and empty strings. `FilePath.create(value)` returns `Result<FilePath, InvalidFilePath>`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/file-not-found.error.ts` | `FileNotFound` | `File not found with id: "<id>"` |
| `domain/errors/invalid-file-path.error.ts` | `InvalidFilePath` | `Invalid file path: "<path>"` |
| `domain/errors/file-too-large.error.ts` | `FileTooLarge` | `File size <size> bytes exceeds maximum allowed size of <maxSize> bytes` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/file-uploaded.event.ts` | `FileUploaded` | `fileId: string`, `name: string`, `mimeType: string`, `size: number`, `occurredAt: Date` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/file-storage.port.ts` | `IFileStorage` | `save(file)`, `findById(fileId)`, `delete(fileId)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/upload-file.dto.ts` | `UploadFileInput` | `name: string`, `path: string`, `mimeType: string`, `size: number` |
| `application/dto/upload-file.dto.ts` | `UploadFileOutput` | `fileId: string` |
| `application/dto/get-file.dto.ts` | `GetFileInput` | `fileId: string` |
| `application/dto/get-file.dto.ts` | `GetFileOutput` | `id`, `name`, `path`, `mimeType`, `size`, `uploadedAt` |
| `application/dto/delete-file.dto.ts` | `DeleteFileInput` | `fileId: string` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/upload-file.use-case.ts` | `UploadFile` | `Result<{ output: UploadFileOutput; event: FileUploaded }, Error>` |
| `application/use-cases/get-file.use-case.ts` | `GetFile` | `Result<GetFileOutput, FileNotFound>` |
| `application/use-cases/delete-file.use-case.ts` | `DeleteFile` | `Result<void, FileNotFound>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/files.contract.ts` | `IFilesService`, DTOs | The only public interface consumers depend on |
| `contracts/files.factory.ts` | `createFilesService(deps: FilesServiceDeps): IFilesService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

### Adapters

| File | Export | Implements |
|---|---|---|
| `adapters/express/files/files.router.ts` | `createFilesRouter(filesService, router, uploadMiddleware?)` | `POST /files` (multipart) → 201 / 413 / 400; `GET /files/:id` → 200 / 404; `DELETE /files/:id` → 200 / 404 |
| `adapters/prisma/files/prisma-file-storage.ts` | `PrismaFileStorage` | `IFileStorage` backed by Prisma |
| `adapters/prisma/files/files.schema.prisma` | — | Prisma `FileRecord` model fragment to merge into `schema.prisma` |

## Storage Backend Swap Guide

To replace the default Prisma-based storage with a custom backend (e.g., S3, local disk):

1. Create a new class implementing `IFileStorage` from `application/ports/file-storage.port.ts`
2. Implement the three methods: `save(file)`, `findById(fileId)`, `delete(fileId)`
3. Pass your implementation to `createFilesService({ fileStorage: yourStorage })`

## CLI Commands

| Command | Description |
|---|---|
| `npx @backcap/cli add files` | Install the files capability (prompts for adapter selection) |
| `npx @backcap/cli add files --yes` | Non-interactive install; auto-selects detected adapters |
