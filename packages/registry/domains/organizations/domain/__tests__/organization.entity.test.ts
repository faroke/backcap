import { describe, it, expect } from "vitest";
import { Organization } from "../entities/organization.entity.js";

describe("Organization entity", () => {
  const validParams = {
    id: "org-1",
    name: "My Organization",
    slug: "my-org",
  };

  it("creates a valid organization", () => {
    const result = Organization.create(validParams);
    expect(result.isOk()).toBe(true);
    const org = result.unwrap();
    expect(org.id).toBe("org-1");
    expect(org.name).toBe("My Organization");
    expect(org.slug.value).toBe("my-org");
    expect(org.plan).toBe("free");
    expect(org.settings).toEqual({});
    expect(org.createdAt).toBeInstanceOf(Date);
    expect(org.updatedAt).toBeInstanceOf(Date);
  });

  it("creates with custom plan and settings", () => {
    const result = Organization.create({
      ...validParams,
      plan: "pro",
      settings: { maxMembers: 50 },
    });
    expect(result.isOk()).toBe(true);
    const org = result.unwrap();
    expect(org.plan).toBe("pro");
    expect(org.settings).toEqual({ maxMembers: 50 });
  });

  it("fails with empty name", () => {
    const result = Organization.create({ ...validParams, name: "" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("name");
  });

  it("fails with whitespace-only name", () => {
    const result = Organization.create({ ...validParams, name: "   " });
    expect(result.isFail()).toBe(true);
  });

  it("fails with invalid slug", () => {
    const result = Organization.create({ ...validParams, slug: "-invalid" });
    expect(result.isFail()).toBe(true);
  });

  it("trims name whitespace", () => {
    const result = Organization.create({ ...validParams, name: "  My Org  " });
    expect(result.unwrap().name).toBe("My Org");
  });

  it("updateName returns new organization with updated name", () => {
    const org = Organization.create(validParams).unwrap();
    const result = org.updateName("New Name");
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().name).toBe("New Name");
    // Original unchanged
    expect(org.name).toBe("My Organization");
  });

  it("updateName fails with empty name", () => {
    const org = Organization.create(validParams).unwrap();
    const result = org.updateName("");
    expect(result.isFail()).toBe(true);
  });

  it("updateSettings merges settings", () => {
    const org = Organization.create({
      ...validParams,
      settings: { theme: "dark" },
    }).unwrap();
    const result = org.updateSettings({ locale: "fr" });
    expect(result.isOk()).toBe(true);
    const updated = result.unwrap();
    expect(updated.settings).toEqual({ theme: "dark", locale: "fr" });
    // Original unchanged
    expect(org.settings).toEqual({ theme: "dark" });
  });

  it("updateSettings rejects oversized settings", () => {
    const org = Organization.create(validParams).unwrap();
    const huge = { data: "x".repeat(70_000) };
    const result = org.updateSettings(huge);
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError().message).toContain("64KB");
  });
});
