import { describe, it, expect, beforeEach } from "vitest";
import { ListMedia } from "../use-cases/list-media.use-case.js";
import { InMemoryMediaRepository } from "./mocks/media-repository.mock.js";
import { createTestMediaAsset } from "./fixtures/media-asset.fixture.js";

describe("ListMedia use case", () => {
  let mediaRepository: InMemoryMediaRepository;
  let listMedia: ListMedia;

  beforeEach(() => {
    mediaRepository = new InMemoryMediaRepository();
    listMedia = new ListMedia(mediaRepository);
  });

  it("lists all media assets", async () => {
    await mediaRepository.save(createTestMediaAsset({ id: "m1" }));
    await mediaRepository.save(createTestMediaAsset({ id: "m2" }));

    const result = await listMedia.execute({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(2);
  });

  it("returns empty list when no media exists", async () => {
    const result = await listMedia.execute({});

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(0);
  });

  it("supports pagination with limit and offset", async () => {
    await mediaRepository.save(createTestMediaAsset({ id: "m1" }));
    await mediaRepository.save(createTestMediaAsset({ id: "m2" }));
    await mediaRepository.save(createTestMediaAsset({ id: "m3" }));

    const result = await listMedia.execute({ limit: 2, offset: 1 });

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().items).toHaveLength(2);
  });
});
