# Files Capability — Domain Map

Complete file-by-file reference for the `files` capability.

## Domain Layer

### `domain/entities/file.entity.ts`

- **Export**: `File`
- **Type**: Entity (Aggregate Root)
- **Properties**: `id` (string), `name` (string), `path` (FilePath), `mimeType` (string), `size` (number), `uploadedAt` (Date)
- **Factory**: `File.create(params)` → `Result<File, InvalidFilePath | FileTooLarge>`
- **Validation**: Size must be a positive integer; path validated via `FilePath` VO

### `domain/value-objects/file-path.vo.ts`

- **Export**: `FilePath`
- **Type**: Value Object
- **Property**: `value` (readonly string)
- **Factory**: `FilePath.create(value)` → `Result<FilePath, InvalidFilePath>`
- **Validation**: Non-empty, no `..` traversal, matches `^[a-zA-Z0-9._\-][a-zA-Z0-9._\-/]*$`

### `domain/events/file-uploaded.event.ts`

- **Export**: `FileUploaded`
- **Type**: Domain Event
- **Properties**: `fileId`, `name`, `mimeType`, `size`, `occurredAt` (defaults to `new Date()`)

### `domain/errors/`

| File | Class | Factory |
|---|---|---|
| `file-not-found.error.ts` | `FileNotFound extends Error` | `static create(fileId: string)` |
| `invalid-file-path.error.ts` | `InvalidFilePath extends Error` | `static create(path: string)` |
| `file-too-large.error.ts` | `FileTooLarge extends Error` | `static create(size: number, maxSize: number)` |

## Application Layer

### `application/ports/file-storage.port.ts`

- **Export**: `IFileStorage`
- **Methods**: `save(file: File)`, `findById(fileId: string)`, `delete(fileId: string)`

### `application/dto/`

| File | Interfaces |
|---|---|
| `upload-file.dto.ts` | `UploadFileInput` (name, path, mimeType, size), `UploadFileOutput` (fileId) |
| `get-file.dto.ts` | `GetFileInput` (fileId), `GetFileOutput` (id, name, path, mimeType, size, uploadedAt) |
| `delete-file.dto.ts` | `DeleteFileInput` (fileId) |

### `application/use-cases/`

| File | Class | Dependency | Returns |
|---|---|---|---|
| `upload-file.use-case.ts` | `UploadFile` | `IFileStorage` | `Result<{ output, event }, Error>` |
| `get-file.use-case.ts` | `GetFile` | `IFileStorage` | `Result<GetFileOutput, FileNotFound>` |
| `delete-file.use-case.ts` | `DeleteFile` | `IFileStorage` | `Result<void, FileNotFound>` |

## Contracts Layer

| File | Export |
|---|---|
| `files.contract.ts` | `IFilesService` interface |
| `files.factory.ts` | `createFilesService(deps)` factory |
| `index.ts` | Barrel re-exports |
