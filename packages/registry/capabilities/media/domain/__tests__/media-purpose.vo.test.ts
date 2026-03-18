import { describe, it, expect } from "vitest";
import { MediaPurpose } from "../value-objects/media-purpose.vo.js";

describe("MediaPurpose VO", () => {
  it("creates thumbnail purpose", () => {
    const purpose = MediaPurpose.thumbnail();
    expect(purpose.value).toBe("thumbnail");
  });

  it("creates preview purpose", () => {
    const purpose = MediaPurpose.preview();
    expect(purpose.value).toBe("preview");
  });

  it("creates original purpose", () => {
    const purpose = MediaPurpose.original();
    expect(purpose.value).toBe("original");
  });

  it("creates optimized purpose", () => {
    const purpose = MediaPurpose.optimized();
    expect(purpose.value).toBe("optimized");
  });

  it("creates from valid string", () => {
    const result = MediaPurpose.from("thumbnail");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().value).toBe("thumbnail");
  });

  it("rejects invalid purpose string", () => {
    const result = MediaPurpose.from("unknown");
    expect(result.isFail()).toBe(true);
  });

  it("compares equality", () => {
    const a = MediaPurpose.thumbnail();
    const b = MediaPurpose.thumbnail();
    const c = MediaPurpose.preview();
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
