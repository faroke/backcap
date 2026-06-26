import { describe, it, expect } from "vitest";
import { FileVariant } from "../entities/file-variant.entity.js";

describe("FileVariant entity", () => {
  const validParams = {
    id: "var-1",
    url: "uploads/photo-thumb.jpg",
    width: 150,
    height: 150,
    format: "jpeg",
    purpose: "thumbnail",
  };

  it("creates a valid variant", () => {
    const result = FileVariant.create(validParams);
    expect(result.isOk()).toBe(true);
    const variant = result.unwrap();
    expect(variant.id).toBe("var-1");
    expect(variant.url).toBe("uploads/photo-thumb.jpg");
    expect(variant.width).toBe(150);
    expect(variant.height).toBe(150);
    expect(variant.format).toBe("jpeg");
    expect(variant.purpose.value).toBe("thumbnail");
  });

  it("fails with invalid dimensions", () => {
    const result = FileVariant.create({ ...validParams, width: 0 });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty URL", () => {
    const result = FileVariant.create({ ...validParams, url: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with empty format", () => {
    const result = FileVariant.create({ ...validParams, format: "" });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid purpose", () => {
    const result = FileVariant.create({ ...validParams, purpose: "invalid" });
    expect(result.isFail()).toBe(true);
  });
});
