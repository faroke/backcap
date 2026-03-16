import { describe, it, expect, vi, beforeEach } from "vitest";
import { configExists, loadConfig, writeConfig } from "../../src/config/loader.js";
import { ValidationError } from "../../src/errors/config.error.js";

vi.mock("node:fs/promises", () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { stat, readFile, writeFile } from "node:fs/promises";
const mockStat = vi.mocked(stat);
const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

const validConfig = {
  framework: "express",
  packageManager: "npm",
  paths: {
    capabilities: "src/capabilities",
    adapters: "src/adapters",
    bridges: "src/bridges",
    skills: "src/skills",
    shared: "src/shared",
  },
  installed: [],
};

describe("configExists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when backcap.json exists", async () => {
    mockStat.mockResolvedValue({} as any);
    expect(await configExists("/fake")).toBe(true);
  });

  it("returns false when backcap.json does not exist", async () => {
    mockStat.mockRejectedValue(new Error("ENOENT"));
    expect(await configExists("/fake")).toBe(false);
  });
});

describe("loadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and validates a valid config", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify(validConfig));
    const result = await loadConfig("/fake");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().framework).toBe("express");
  });

  it("returns fail with ValidationError for invalid config", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ framework: "express" }));
    const result = await loadConfig("/fake");
    expect(result.isFail()).toBe(true);
    const error = result.unwrapError();
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toContain("validation failed");
  });

  it("returns fail when file cannot be read", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    const result = await loadConfig("/fake");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().code).toBe("LOAD_ERROR");
  });
});

describe("writeConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes config with normalized paths", async () => {
    mockWriteFile.mockResolvedValue(undefined);
    const result = await writeConfig(validConfig, "/fake");
    expect(result.isOk()).toBe(true);
    expect(mockWriteFile).toHaveBeenCalledOnce();

    const written = JSON.parse(
      (mockWriteFile.mock.calls[0]![1] as string).trim(),
    );
    expect(written.framework).toBe("express");
    expect(written.paths.capabilities).toBe("src/capabilities");
  });

  it("returns fail when write throws", async () => {
    mockWriteFile.mockRejectedValue(new Error("EACCES"));
    const result = await writeConfig(validConfig, "/fake");
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().code).toBe("WRITE_ERROR");
  });
});
