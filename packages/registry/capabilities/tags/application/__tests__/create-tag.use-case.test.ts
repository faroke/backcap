import { describe, it, expect, beforeEach } from "vitest";
import { CreateTag } from "../use-cases/create-tag.use-case.js";
import { InMemoryTagRepository } from "./mocks/in-memory-tag-repository.mock.js";
import { TagAlreadyExists } from "../../domain/errors/tag-already-exists.error.js";

describe("CreateTag use case", () => {
  let repo: InMemoryTagRepository;
  let createTag: CreateTag;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    createTag = new CreateTag(repo);
  });

  it("creates a tag successfully", async () => {
    const result = await createTag.execute({ name: "JavaScript" });
    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.tagId).toBeDefined();
    expect(output.slug).toBe("javascript");
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(event.slug).toBe("javascript");
  });

  it("auto-generates a slug from the name", async () => {
    const result = await createTag.execute({ name: "Web Development" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().output.slug).toBe("web-development");
  });

  it("fails when a tag with the same slug already exists", async () => {
    await createTag.execute({ name: "JavaScript" });
    const result = await createTag.execute({ name: "JavaScript" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(TagAlreadyExists);
  });
});
