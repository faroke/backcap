import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ofetch", () => ({
  ofetch: vi.fn(),
  FetchError: class FetchError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = "FetchError";
    }
  },
}));

vi.mock("consola", () => ({
  createConsola: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    start: vi.fn(),
  }),
}));

import { ofetch, FetchError } from "ofetch";
import { fetchRegistry } from "../src/lib/registry-fetch.js";
import { RegistryError } from "../src/errors/registry.error.js";
import { mockRegistryData } from "./fixtures/registry.fixture.js";

const mockOfetch = vi.mocked(ofetch);

describe("fetchRegistry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches from primary URL and validates", async () => {
    mockOfetch.mockResolvedValue(mockRegistryData);
    const result = await fetchRegistry("https://example.com/registry.json");
    expect(result).toBeDefined();
    expect((result as { name: string }).name).toBe("backcap-registry");
  });

  it("falls back to GitHub URL on primary failure", async () => {
    mockOfetch
      .mockRejectedValueOnce(new FetchError("timeout"))
      .mockResolvedValueOnce(mockRegistryData);

    const result = await fetchRegistry("https://example.com/registry.json");
    expect(result).toBeDefined();
    expect(mockOfetch).toHaveBeenCalledTimes(2);
  });

  it("throws RegistryError when both URLs fail", async () => {
    mockOfetch
      .mockRejectedValueOnce(new FetchError("timeout"))
      .mockRejectedValueOnce(new FetchError("timeout"));

    await expect(
      fetchRegistry("https://example.com/registry.json"),
    ).rejects.toThrow(RegistryError);
  });

  it("throws RegistryError on invalid response", async () => {
    mockOfetch.mockResolvedValue({ invalid: "data" });
    await expect(
      fetchRegistry("https://example.com/registry.json"),
    ).rejects.toThrow("Registry response is invalid");
  });
});
