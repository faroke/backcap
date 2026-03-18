---
"@backcap/registry": minor
---

feat(registry): media bridges — blog-media and media-files (story 11.2)

Two hybrid bridges connecting media to blog and files capabilities:

- **blog-media**: `MediaDeleted` → cleanup blog post media references (featured images, inline images); `createBlogMediaResolver()` provides `IBlogMediaResolver` wrapping `IMediaService.getMediaUrl()` for blog post media URL resolution
- **media-files**: `MediaUploaded` → triggers `ProcessMedia` for variant generation; `createFileBackedMediaStorage()` provides `IMediaStorageAdapter` wrapping `IFileStorage` for raw file and variant persistence through the files layer

17 tests added, all passing. Zero regressions (1281 total).
