import { describe, it, expect } from "vitest";
import { renderCapabilityTable } from "../src/lib/render-table.js";

const items = [
  { name: "auth", description: "Authentication capability", type: "capability" },
  { name: "blog", description: "Blog capability with a very long description that exceeds sixty characters in total length for truncation testing purposes", type: "capability" },
  { name: "auth-prisma", description: "Prisma adapter", type: "adapter" },
];

describe("renderCapabilityTable", () => {
  it("renders table with installed markers", () => {
    const output = renderCapabilityTable(items, new Set(["auth"]));
    expect(output).toContain("auth");
    expect(output).toContain("✓");
    expect(output).toContain("blog");
    expect(output).toContain("—");
  });

  it("only shows capabilities, not adapters", () => {
    const output = renderCapabilityTable(items, new Set());
    expect(output).not.toContain("auth-prisma");
  });

  it("truncates long descriptions", () => {
    const output = renderCapabilityTable(items, new Set());
    expect(output).toContain("...");
  });

  it("shows total count footer", () => {
    const output = renderCapabilityTable(items, new Set());
    expect(output).toContain("2 capabilities available");
  });

  it("handles empty items", () => {
    const output = renderCapabilityTable([], new Set());
    expect(output).toContain("0 capabilities available");
  });
});
