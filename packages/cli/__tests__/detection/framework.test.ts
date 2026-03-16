import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectFramework } from "../../src/detection/framework.js";

vi.mock("pkg-types", () => ({
  readPackageJSON: vi.fn(),
}));

import { readPackageJSON } from "pkg-types";
const mockReadPkg = vi.mocked(readPackageJSON);

describe("detectFramework", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects Next.js", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { next: "^14.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("nextjs");
  });

  it("detects Express", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { express: "^4.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("express");
  });

  it("detects Fastify", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { fastify: "^4.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("fastify");
  });

  it("detects NestJS", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { "@nestjs/core": "^10.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("nestjs");
  });

  it("detects Hono", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { hono: "^3.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("hono");
  });

  it("detects framework in devDependencies", async () => {
    mockReadPkg.mockResolvedValue({ devDependencies: { next: "^14.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe("nextjs");
  });

  it("returns fail when no framework found", async () => {
    mockReadPkg.mockResolvedValue({ dependencies: { lodash: "^4.0.0" } } as any);
    const result = await detectFramework("/fake");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().field).toBe("framework");
  });

  it("returns fail when readPackageJSON throws", async () => {
    mockReadPkg.mockRejectedValue(new Error("ENOENT"));
    const result = await detectFramework("/fake");
    expect(result.isFail()).toBe(true);
  });

  it("respects priority order (next > express when both present)", async () => {
    mockReadPkg.mockResolvedValue({
      dependencies: { next: "^14.0.0", express: "^4.0.0" },
    } as any);
    const result = await detectFramework("/fake");
    expect(result.unwrap()).toBe("nextjs");
  });
});
