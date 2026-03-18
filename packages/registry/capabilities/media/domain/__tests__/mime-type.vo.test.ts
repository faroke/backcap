import { describe, it, expect } from "vitest";
import { MimeType } from "../value-objects/mime-type.vo.js";
import { UnsupportedFormat } from "../errors/unsupported-format.error.js";

describe("MimeType VO", () => {
  it("creates a valid image MIME type", () => {
    const result = MimeType.create("image/jpeg");
    expect(result.isOk()).toBe(true);
    const mime = result.unwrap();
    expect(mime.value).toBe("image/jpeg");
    expect(mime.category).toBe("image");
    expect(mime.isImage()).toBe(true);
    expect(mime.isVideo()).toBe(false);
    expect(mime.isDocument()).toBe(false);
  });

  it("creates a valid video MIME type", () => {
    const result = MimeType.create("video/mp4");
    expect(result.isOk()).toBe(true);
    const mime = result.unwrap();
    expect(mime.category).toBe("video");
    expect(mime.isVideo()).toBe(true);
  });

  it("creates a valid document MIME type", () => {
    const result = MimeType.create("application/pdf");
    expect(result.isOk()).toBe(true);
    const mime = result.unwrap();
    expect(mime.category).toBe("document");
    expect(mime.isDocument()).toBe(true);
  });

  it("rejects unsupported MIME type", () => {
    const result = MimeType.create("application/x-unknown");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UnsupportedFormat);
  });

  it("rejects empty MIME type", () => {
    const result = MimeType.create("");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(UnsupportedFormat);
  });

  it("supports webp images", () => {
    const result = MimeType.create("image/webp");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().isImage()).toBe(true);
  });

  it("normalizes case to lowercase", () => {
    const result = MimeType.create("Image/JPEG");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("image/jpeg");
    expect(result.unwrap().isImage()).toBe(true);
  });

  it("compares equality", () => {
    const a = MimeType.create("image/png").unwrap();
    const b = MimeType.create("image/png").unwrap();
    const c = MimeType.create("image/jpeg").unwrap();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
