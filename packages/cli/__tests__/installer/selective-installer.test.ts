import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clack/prompts", () => ({
  multiselect: vi.fn(),
  isCancel: vi.fn(),
}));

import * as clack from "@clack/prompts";
import { selectiveInstall, InstallCancelledError } from "../../src/installer/selective-installer.js";
import type { ConflictReport } from "../../src/installer/conflict-detector.js";

const mockMultiselect = vi.mocked(clack.multiselect);
const mockIsCancel = vi.mocked(clack.isCancel);

describe("selectiveInstall", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsCancel.mockReturnValue(false);
  });

  const baseReport: ConflictReport = {
    hasConflicts: true,
    files: [
      { relativePath: "domain/user.entity.ts", status: "new", incomingContent: "new code" },
      { relativePath: "contracts/index.ts", status: "modified", existingContent: "old", incomingContent: "new" },
      { relativePath: "shared/result.ts", status: "identical", existingContent: "same", incomingContent: "same" },
    ],
  };

  it("returns all files as installed when user selects all", async () => {
    mockMultiselect.mockResolvedValue([
      "domain/user.entity.ts",
      "contracts/index.ts",
      "shared/result.ts",
    ]);

    const result = await selectiveInstall(baseReport, new Set());

    expect(result.installed).toEqual([
      "domain/user.entity.ts",
      "contracts/index.ts",
      "shared/result.ts",
    ]);
    expect(result.skipped).toEqual([]);
    expect(result.alwaysInstalled).toEqual([]);
  });

  it("skips deselected modified file", async () => {
    mockMultiselect.mockResolvedValue([
      "domain/user.entity.ts",
      "shared/result.ts",
    ]);

    const result = await selectiveInstall(baseReport, new Set());

    expect(result.installed).toEqual(["domain/user.entity.ts", "shared/result.ts"]);
    expect(result.skipped).toEqual(["contracts/index.ts"]);
  });

  it("always includes skill files even if not selected", async () => {
    const skillFiles = new Set(["domain/user.entity.ts"]);
    mockMultiselect.mockResolvedValue(["shared/result.ts"]);

    const result = await selectiveInstall(baseReport, skillFiles);

    expect(result.alwaysInstalled).toEqual(["domain/user.entity.ts"]);
    expect(result.installed).toEqual(["shared/result.ts"]);
    expect(result.skipped).toEqual(["contracts/index.ts"]);
  });

  it("throws InstallCancelledError when user cancels", async () => {
    mockIsCancel.mockReturnValue(true);
    mockMultiselect.mockResolvedValue(Symbol("cancel") as any);

    await expect(selectiveInstall(baseReport, new Set())).rejects.toThrow(
      InstallCancelledError,
    );
  });

  it("pre-checks new and identical files but not modified", async () => {
    mockMultiselect.mockImplementation(async (opts: any) => {
      // Verify initial values exclude modified files
      expect(opts.initialValues).toContain("domain/user.entity.ts");
      expect(opts.initialValues).toContain("shared/result.ts");
      expect(opts.initialValues).not.toContain("contracts/index.ts");
      return opts.initialValues;
    });

    await selectiveInstall(baseReport, new Set());
  });
});
