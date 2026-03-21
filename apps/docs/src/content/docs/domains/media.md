---
title: Media Domain
description: Media asset management with image/video processing, variant generation, and CDN-aware URL resolution for TypeScript backends.
---

The `media` domain provides **media asset management with processing and variant generation** for TypeScript backends. It is structured in strict Clean Architecture layers with zero npm dependencies in the domain and application layers.

## Install

```bash
npx @backcap/cli add media
```

## Domain Model

### MediaAsset Entity

The `MediaAsset` entity is the aggregate root. It holds media metadata, dimensions (for images/videos), and a list of variants (thumbnails, previews, etc.).

```typescript
import { MediaAsset } from "./domains/media/domain/entities/media-asset.entity";

const result = MediaAsset.create({
  id: crypto.randomUUID(),
  originalUrl: "uploads/photo.jpg",
  mimeType: "image/jpeg",
  width: 1920,
  height: 1080,
  size: 204800,
});

if (result.isOk()) {
  const asset = result.unwrap();
  console.log(asset.id, asset.mimeType.value, asset.dimensions?.width);
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (UUID) |
| `originalUrl` | `string` | URL or path to the original file |
| `mimeType` | `MimeType` | Validated MIME type with category |
| `dimensions` | `Dimensions \| null` | Width and height (null for non-visual media) |
| `size` | `number` | File size in bytes (positive integer) |
| `variants` | `ReadonlyArray<MediaVariant>` | Generated variants (thumbnails, previews, etc.) |
| `uploadedAt` | `Date` | Timestamp of upload |

`MediaAsset.create()` returns `Result<MediaAsset, UnsupportedFormat | FileTooLarge | Error>`. The entity is immutable — `addVariant()` and `withVariants()` return new instances.

### MediaVariant Entity

```typescript
import { MediaVariant } from "./domains/media/domain/entities/media-variant.entity";

const result = MediaVariant.create({
  id: crypto.randomUUID(),
  url: "uploads/photo-thumb.jpg",
  width: 150,
  height: 150,
  format: "jpeg",
  purpose: "thumbnail",
});
```

### Value Objects

#### MimeType

Validates against a supported list and categorizes as `image`, `video`, or `document`.

```typescript
import { MimeType } from "./domains/media/domain/value-objects/mime-type.vo";

const result = MimeType.create("image/jpeg");
if (result.isOk()) {
  const mime = result.unwrap();
  console.log(mime.category); // "image"
  console.log(mime.isImage()); // true
}
```

Supported types include: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `image/avif`, `video/mp4`, `video/webm`, `video/quicktime`, `application/pdf`, and more.

#### Dimensions

Width and height as positive integers with aspect ratio computation.

```typescript
import { Dimensions } from "./domains/media/domain/value-objects/dimensions.vo";

const dims = Dimensions.create(1920, 1080).unwrap();
console.log(dims.aspectRatio); // ~1.778 (16:9)
```

#### MediaPurpose

Enum value object: `thumbnail`, `preview`, `original`, `optimized`.

```typescript
import { MediaPurpose } from "./domains/media/domain/value-objects/media-purpose.vo";

const purpose = MediaPurpose.thumbnail();
const fromString = MediaPurpose.from("preview"); // Result<MediaPurpose, Error>
```

### Domain Errors

| Error Class | Condition | Message |
|---|---|---|
| `UnsupportedFormat` | MIME type not in supported list | `Unsupported media format: "<mimeType>"` |
| `MediaNotFound` | No media found for the given ID | `Media not found with id: "<id>"` |
| `ProcessingFailed` | Variant generation failed | `Media processing failed for "<id>": <reason>` |
| `FileTooLarge` | File exceeds maximum allowed size | `File size <size> bytes exceeds maximum allowed size of <maxSize> bytes` |

### Domain Events

| Event | Emitted By | Payload |
|---|---|---|
| `MediaUploaded` | `UploadMedia` use case | `mediaId`, `name`, `mimeType`, `size`, `occurredAt` |
| `MediaProcessed` | `ProcessMedia` use case | `mediaId`, `variantCount`, `occurredAt` |
| `MediaDeleted` | — (available for bridge consumers) | `mediaId`, `occurredAt` |

## Application Layer

### Use Cases

#### UploadMedia

Creates a new media asset, validates MIME type and size, persists it, and emits a `MediaUploaded` event.

```typescript
const result = await uploadMedia.execute({
  name: "photo.jpg",
  originalUrl: "uploads/photo.jpg",
  mimeType: "image/jpeg",
  size: 204800,
  width: 1920,
  height: 1080,
});
// Result<{ output: { mediaId: string }; event: MediaUploaded }, Error>
```

#### ProcessMedia

Generates variants (thumbnails, previews) using the `IMediaProcessor` port.

```typescript
const result = await processMedia.execute({
  mediaId: "abc-123",
  variants: [
    { purpose: "thumbnail", width: 150, height: 150, format: "jpeg" },
    { purpose: "preview", width: 800, height: 600, format: "webp" },
  ],
});
// Result<{ output: { mediaId, variantCount }; event: MediaProcessed }, Error>
```

#### GetMedia / ListMedia / DeleteMedia / GetMediaUrl

```typescript
const media = await getMedia.execute({ mediaId: "abc-123" });
const list = await listMedia.execute({ limit: 20, offset: 0 });
const deleted = await deleteMedia.execute({ mediaId: "abc-123" });
const url = await getMediaUrl.execute({ mediaId: "abc-123", purpose: "thumbnail" });
```

### Port Interfaces

#### IMediaRepository

```typescript
export interface FindAllOptions {
  limit?: number;
  offset?: number;
}

export interface IMediaRepository {
  save(asset: MediaAsset): Promise<void>;
  findById(mediaId: string): Promise<MediaAsset | null>;
  findAll(options?: FindAllOptions): Promise<MediaAsset[]>;
  delete(mediaId: string): Promise<void>;
}
```

#### IMediaProcessor

```typescript
export interface IMediaProcessor {
  resize(inputUrl: string, width: number, height: number): Promise<ProcessedOutput>;
  convert(inputUrl: string, format: string): Promise<ProcessedOutput>;
  generateThumbnail(inputUrl: string, size: number): Promise<ProcessedOutput>;
}
```

#### IMediaStorage

```typescript
export interface IMediaStorage {
  upload(key: string, data: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}
```

## Public API (contracts/)

```typescript
import { createMediaService, IMediaService } from "./domains/media/contracts";

const mediaService: IMediaService = createMediaService({
  mediaRepository,
  mediaProcessor,
  mediaStorage,
});

// IMediaService interface:
// upload(input): Promise<Result<{ output: UploadMediaOutput; event: MediaUploaded }, Error>>
// process(input): Promise<Result<{ output: ProcessMediaOutput; event: MediaProcessed }, Error>>
// get(input): Promise<Result<GetMediaOutput, Error>>
// list(input): Promise<Result<ListMediaOutput, Error>>
// delete(input): Promise<Result<{ event: MediaDeleted }, Error>>
// getUrl(input): Promise<Result<GetMediaUrlOutput, Error>>
```

## Adapters

### media-prisma

Provides `PrismaMediaRepository` which implements `IMediaRepository` with transaction support for variant sync.

```bash
npx @backcap/cli add media-prisma
```

```typescript
import { PrismaMediaRepository } from "./adapters/prisma/media/prisma-media-repository";

const mediaRepository = new PrismaMediaRepository(prisma);
```

Requires Prisma schema with `MediaAssetRecord` and `MediaVariantRecord` models:

```prisma
model MediaAssetRecord {
  id          String               @id @default(uuid())
  originalUrl String
  mimeType    String
  width       Int?
  height      Int?
  size        BigInt
  uploadedAt  DateTime             @default(now())
  variants    MediaVariantRecord[]
}

model MediaVariantRecord {
  id           String           @id @default(uuid())
  mediaAssetId String
  url          String
  width        Int
  height       Int
  format       String
  purpose      String
  mediaAsset   MediaAssetRecord @relation(fields: [mediaAssetId], references: [id])
}
```

### media-express

Provides `createMediaRouter()` with multipart upload, processing, and CDN URL endpoints.

```bash
npx @backcap/cli add media-express
```

```typescript
import { createMediaRouter } from "./adapters/express/media/media.router";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
createMediaRouter(mediaService, router, upload.single("file"));
app.use(router);
```

**Routes added:**

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/media` | `multipart/form-data` | `201 { mediaId }` or error |
| `POST` | `/media/:id/process` | `{ variants: [...] }` | `200 { mediaId, variantCount }` or error |
| `GET` | `/media` | — | `200 { items: [...] }` |
| `GET` | `/media/:id` | — | `200 { id, originalUrl, ... }` or `404` |
| `GET` | `/media/:id/url` | `?purpose=thumbnail` | `200 { url }` or `404` |
| `DELETE` | `/media/:id` | — | `200 { success }` or `404` |

**HTTP error mapping:**

| Domain Error | HTTP Status |
|---|---|
| `MediaNotFound` | `404 Not Found` |
| `FileTooLarge` | `413 Payload Too Large` |
| `UnsupportedFormat` | `400 Bad Request` |
| `ProcessingFailed` | `422 Unprocessable Entity` |

## Bridges

### blog-media

When both `blog` and `media` are installed, the `blog-media` bridge connects them:

- **Event-driven:** `MediaDeleted` triggers cleanup of blog post media references (featured images, inline images)
- **DI factory:** `createBlogMediaResolver()` provides an `IBlogMediaResolver` that wraps `IMediaService.getMediaUrl()` — use it to resolve media URLs for blog post featured images or inline content

```typescript
import { createBlogMediaResolver } from "./bridges/blog-media/blog-media.bridge.js";

const resolver = createBlogMediaResolver({ getMediaUrl: mediaService });
const url = await resolver.getMediaUrl("media-123", "thumbnail");
```

### media-files

When both `media` and `files` are installed, the `media-files` bridge connects them:

- **DI factory:** `createFileBackedMediaStorage()` creates an `IMediaStorage` adapter that delegates to the files domain's `IFileStorage` — raw file storage and variant persistence go through the files layer
- **Event-driven:** `MediaUploaded` triggers `ProcessMedia` to generate variants after storage confirms success

```typescript
import { createFileBackedMediaStorage } from "./bridges/media-files/media-files.bridge.js";

const mediaStorage = createFileBackedMediaStorage({ fileStorage });
// Use mediaStorage as the IMediaStorage implementation
```

## Distinction from Files Domain

- **files** = raw upload/download/delete — no processing, no variants, no metadata enrichment
- **media** = processing-aware — thumbnails, format conversion, dimensions, variants, CDN URLs
- When both are installed, the `media-files` bridge delegates raw storage to files' `IFileStorage`

## File Map

```
domains/media/
  domain/
    entities/media-asset.entity.ts
    entities/media-variant.entity.ts
    value-objects/mime-type.vo.ts
    value-objects/dimensions.vo.ts
    value-objects/media-purpose.vo.ts
    errors/unsupported-format.error.ts
    errors/media-not-found.error.ts
    errors/processing-failed.error.ts
    errors/file-too-large.error.ts
    events/media-uploaded.event.ts
    events/media-processed.event.ts
    events/media-deleted.event.ts
  application/
    use-cases/upload-media.use-case.ts
    use-cases/process-media.use-case.ts
    use-cases/get-media.use-case.ts
    use-cases/list-media.use-case.ts
    use-cases/delete-media.use-case.ts
    use-cases/get-media-url.use-case.ts
    ports/media-repository.port.ts
    ports/media-processor.port.ts
    ports/media-storage.port.ts
    dto/upload-media.dto.ts
    dto/process-media.dto.ts
    dto/get-media.dto.ts
    dto/list-media.dto.ts
    dto/delete-media.dto.ts
    dto/get-media-url.dto.ts
  contracts/
    media.contract.ts
    media.factory.ts
    index.ts
  shared/
    result.ts
```
