---
name: backcap-media
description: >
  Backcap media capability: DDD-structured media asset management with image/video processing,
  variant generation (thumbnails, previews, optimized), and CDN-aware URL resolution for TypeScript
  backends. Domain layer contains MediaAsset aggregate (with variants), MediaVariant entity, MimeType
  (validated with category), Dimensions, and MediaPurpose value objects, three domain events
  (MediaUploaded, MediaProcessed, MediaDeleted), and four typed errors (UnsupportedFormat,
  MediaNotFound, ProcessingFailed, FileTooLarge). Application layer has UploadMedia, ProcessMedia,
  GetMedia, ListMedia, DeleteMedia, and GetMediaUrl use cases, plus IMediaRepository,
  IMediaProcessor, and IMediaStorage port interfaces. Public surface is IMediaService and
  createMediaService factory in contracts/. All expected failures return Result<T,E> — no thrown
  errors. Adapters: media-express (router with multipart upload + processing + serving routes),
  media-prisma (PrismaMediaRepository with MediaAssetRecord + MediaVariantRecord). Zero npm
  dependencies in domain and application.
metadata:
  author: Backcap
  version: 1.0.0
---

# backcap-media

The `media` capability provides **media asset management with processing and variant generation**
for TypeScript backends. It is structured in strict Clean Architecture layers and has zero npm
dependencies in the domain and application layers.

For Backcap-wide architecture rules, naming conventions, and the Result pattern, see the
[backcap-core skill](../backcap-core/SKILL.md).

## Domain Map

### Entities

| File | Export | Responsibility |
|---|---|---|
| `domain/entities/media-asset.entity.ts` | `MediaAsset` | Aggregate root. Holds `id`, `originalUrl`, `mimeType: MimeType`, `dimensions: Dimensions | null`, `size`, `variants: MediaVariant[]`, `uploadedAt`. Private constructor; factory via `MediaAsset.create(params)` returning `Result<MediaAsset, UnsupportedFormat \| FileTooLarge \| Error>`. Immutable — `addVariant()` and `withVariants()` return new instances. |
| `domain/entities/media-variant.entity.ts` | `MediaVariant` | Child entity. Holds `id`, `url`, `width`, `height`, `format`, `purpose: MediaPurpose`. Private constructor; factory via `MediaVariant.create(params)` returning `Result<MediaVariant, Error>`. |

### Value Objects

| File | Export | Responsibility |
|---|---|---|
| `domain/value-objects/mime-type.vo.ts` | `MimeType` | Validates MIME type against supported list (case-insensitive), categorizes as `image`, `video`, or `document`. `MimeType.create(value)` normalizes to lowercase and returns `Result<MimeType, UnsupportedFormat>`. |
| `domain/value-objects/dimensions.vo.ts` | `Dimensions` | Width and height positive integers. `Dimensions.create(w, h)` returns `Result<Dimensions, Error>`. Includes `aspectRatio` getter. |
| `domain/value-objects/media-purpose.vo.ts` | `MediaPurpose` | Enum VO: `thumbnail`, `preview`, `original`, `optimized`. Static factories and `MediaPurpose.from(value)`. |

### Domain Errors

| File | Export | Message |
|---|---|---|
| `domain/errors/unsupported-format.error.ts` | `UnsupportedFormat` | `Unsupported media format: "<mimeType>"` |
| `domain/errors/media-not-found.error.ts` | `MediaNotFound` | `Media not found with id: "<id>"` |
| `domain/errors/processing-failed.error.ts` | `ProcessingFailed` | `Media processing failed for "<id>": <reason>` |
| `domain/errors/file-too-large.error.ts` | `FileTooLarge` | `File size <size> bytes exceeds maximum allowed size of <maxSize> bytes` |

### Domain Events

| File | Export | Payload |
|---|---|---|
| `domain/events/media-uploaded.event.ts` | `MediaUploaded` | `mediaId`, `name`, `mimeType`, `size`, `occurredAt` |
| `domain/events/media-processed.event.ts` | `MediaProcessed` | `mediaId`, `variantCount`, `occurredAt` |
| `domain/events/media-deleted.event.ts` | `MediaDeleted` | `mediaId`, `occurredAt` |

### Application — Ports

| File | Interface | Methods |
|---|---|---|
| `application/ports/media-repository.port.ts` | `IMediaRepository` | `save(asset)`, `findById(mediaId)`, `findAll(options?)`, `delete(mediaId)` — `FindAllOptions: { limit?, offset? }` |
| `application/ports/media-processor.port.ts` | `IMediaProcessor` | `resize(inputUrl, w, h)`, `convert(inputUrl, format)`, `generateThumbnail(inputUrl, size)` |
| `application/ports/media-storage.port.ts` | `IMediaStorage` | `upload(key, data)`, `download(key)`, `delete(key)`, `getUrl(key)` |

### Application — DTOs

| File | Interface | Fields |
|---|---|---|
| `application/dto/upload-media.dto.ts` | `UploadMediaInput` | `name`, `originalUrl`, `mimeType`, `size`, `width?`, `height?` |
| `application/dto/upload-media.dto.ts` | `UploadMediaOutput` | `mediaId` |
| `application/dto/process-media.dto.ts` | `ProcessMediaInput` | `mediaId`, `variants[]` (purpose, width, height, format) |
| `application/dto/process-media.dto.ts` | `ProcessMediaOutput` | `mediaId`, `variantCount` |
| `application/dto/get-media.dto.ts` | `GetMediaInput` | `mediaId` |
| `application/dto/get-media.dto.ts` | `GetMediaOutput` | `id`, `originalUrl`, `mimeType`, `width`, `height`, `size`, `variants[]`, `uploadedAt` |
| `application/dto/list-media.dto.ts` | `ListMediaInput` | `limit?`, `offset?` |
| `application/dto/list-media.dto.ts` | `ListMediaOutput` | `items[]` |
| `application/dto/delete-media.dto.ts` | `DeleteMediaInput` | `mediaId` |
| `application/dto/get-media-url.dto.ts` | `GetMediaUrlInput` | `mediaId`, `purpose?` |
| `application/dto/get-media-url.dto.ts` | `GetMediaUrlOutput` | `url` |

### Application — Use Cases

| File | Class | Returns |
|---|---|---|
| `application/use-cases/upload-media.use-case.ts` | `UploadMedia` | `Result<{ output: UploadMediaOutput; event: MediaUploaded }, Error>` |
| `application/use-cases/process-media.use-case.ts` | `ProcessMedia` | `Result<{ output: ProcessMediaOutput; event: MediaProcessed }, Error>` |
| `application/use-cases/get-media.use-case.ts` | `GetMedia` | `Result<GetMediaOutput, MediaNotFound>` |
| `application/use-cases/list-media.use-case.ts` | `ListMedia` | `Result<ListMediaOutput, Error>` |
| `application/use-cases/delete-media.use-case.ts` | `DeleteMedia` | `Result<{ event: MediaDeleted }, MediaNotFound>` |
| `application/use-cases/get-media-url.use-case.ts` | `GetMediaUrl` | `Result<GetMediaUrlOutput, MediaNotFound>` |

### Contracts (public surface)

| File | Export | Description |
|---|---|---|
| `contracts/media.contract.ts` | `IMediaService`, DTOs | The only public interface consumers depend on |
| `contracts/media.factory.ts` | `createMediaService(deps: MediaServiceDeps): IMediaService` | DI factory wiring use cases to port implementations |
| `contracts/index.ts` | re-exports all of the above | The single barrel; import from here only |

### Adapters

| File | Export | Implements |
|---|---|---|
| `adapters/express/media/media.router.ts` | `createMediaRouter(mediaService, router, uploadMiddleware?)` | `POST /media` (multipart) -> 201/413/400; `POST /media/:id/process` -> 200/404/422; `GET /media` -> 200; `GET /media/:id` -> 200/404; `GET /media/:id/url` -> 200/404; `DELETE /media/:id` -> 200/404 |
| `adapters/prisma/media/prisma-media-repository.ts` | `PrismaMediaRepository` | `IMediaRepository` backed by Prisma |
| `adapters/prisma/media/media.schema.prisma` | — | Prisma `MediaAssetRecord` + `MediaVariantRecord` model fragments to merge into `schema.prisma` |

## Distinction from `files` Capability

- `files` = raw upload/download/delete (no processing, no variants, no metadata)
- `media` = processing-aware (thumbnails, format conversion, dimensions, variants, CDN URLs)
- When both are installed, `media-files` bridge can delegate raw storage to files' `IFileStorage`

## CLI Commands

| Command | Description |
|---|---|
| `npx @backcap/cli add media` | Install the media capability (prompts for adapter selection) |
| `npx @backcap/cli add media --yes` | Non-interactive install; auto-selects detected adapters |
