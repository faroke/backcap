import { describe, it, expect } from "vitest";
import { renderDomainTable } from "../src/lib/render-table.js";

const items = [
  { name: "auth", description: "Authentication domain", type: "domain", version: "1.0.0" },
  { name: "blog", description: "Blog domain with a very long description that exceeds sixty characters in total length for truncation testing purposes", type: "domain", version: "0.2.0" },
];

describe("renderDomainTable", () => {
  it("renders table with installed markers", () => {
    const output = renderDomainTable(items, new Set(["auth"]));
    expect(output).toContain("auth");
    expect(output).toContain("✓");
    expect(output).toContain("blog");
    expect(output).toContain("—");
  });

  it("truncates long descriptions", () => {
    const output = renderDomainTable(items, new Set());
    expect(output).toContain("...");
  });

  it("shows total count footer", () => {
    const output = renderDomainTable(items, new Set());
    expect(output).toContain("2 domains available");
  });

  it("handles empty items", () => {
    const output = renderDomainTable([], new Set());
    expect(output).toContain("0 domains available");
  });

  it("displays version column", () => {
    const output = renderDomainTable(items, new Set());
    expect(output).toContain("Version");
    expect(output).toContain("1.0.0");
    expect(output).toContain("0.2.0");
  });

  it("shows dash for missing version", () => {
    const noVersionItems = [
      { name: "files", description: "Search domain", type: "domain" },
    ];
    const output = renderDomainTable(noVersionItems, new Set());
    expect(output).toMatch(/files\s+—/);
  });
});
