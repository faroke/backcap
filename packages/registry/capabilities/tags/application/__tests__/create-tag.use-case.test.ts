import { describe, it, expect, beforeEach } from "vitest";
import { CreateTag } from "../use-cases/create-tag.use-case.js";
import { InMemoryTagRepository } from "./mocks/in-memory-tag-repository.mock.js";
import { createTestTag } from "./fixtures/tag.fixture.js";

describe("CreateTag use case", () => {
  let repo: InMemoryTagRepository;
  let createTag: CreateTag;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    createTag = new CreateTag(repo);
  });

  it("creates a new tag successfully", async () => {
    const result = await createTag.execute({ name: "TypeScript" });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.tagId).toBeDefined();
    expect(output.slug).toBe("typescript");
    expect(output.event.slug).toBe("typescript");

    // Verify tag was stored
    const saved = await repo.findBySlug("typescript");
    expect(saved).not.toBeNull();
    expect(saved!.name).toBe("TypeScript");
  });

  it("returns existing tag if slug already exists", async () => {
    const existing = createTestTag({ id: "existing-1", slug: "typescript" });
    await repo.saveTag(existing);

    const result = await createTag.execute({ name: "TypeScript" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().tagId).toBe("existing-1");
  });

  it("generates slug from name with special characters", async () => {
    const result = await createTag.execute({ name: "C++ Programming" });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().slug).toBe("c-programming");
  });

  it("fails with empty name", async () => {
    const result = await createTag.execute({ name: "   " });

    expect(result.isFail()).toBe(true);
  });

  it("fails with name that produces empty slug", async () => {
    const result = await createTag.execute({ name: "!@#$%" });

    expect(result.isFail()).toBe(true);
  });
});
