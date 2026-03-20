import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clack/prompts", () => ({
  select: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

import * as clack from "@clack/prompts";
import { promptConflictResolution } from "../../src/lib/add-prompts.js";

const mockSelect = vi.mocked(clack.select);

describe("promptConflictResolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows all four options by default", async () => {
    mockSelect.mockResolvedValue("abort");
    await promptConflictResolution();

    const call = mockSelect.mock.calls[0]![0];
    const values = (call.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toEqual(["compare_and_continue", "selective", "different_path", "abort"]);
  });

  it("excludes selective and different_path for bridge context", async () => {
    mockSelect.mockResolvedValue("abort");
    await promptConflictResolution(["selective", "different_path"]);

    const call = mockSelect.mock.calls[0]![0];
    const values = (call.options as Array<{ value: string }>).map((o) => o.value);
    expect(values).toEqual(["compare_and_continue", "abort"]);
    expect(values).not.toContain("selective");
    expect(values).not.toContain("different_path");
  });

  it("returns the selected action", async () => {
    mockSelect.mockResolvedValue("compare_and_continue");
    const result = await promptConflictResolution();
    expect(result).toBe("compare_and_continue");
  });
});
