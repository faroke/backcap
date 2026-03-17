import { describe, it, expect, beforeEach } from "vitest";
import { GetSubmissions } from "../use-cases/get-submissions.use-case.js";
import { InMemoryFormStore } from "./mocks/in-memory-form-store.mock.js";
import { createTestForm } from "./fixtures/form.fixture.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";

describe("GetSubmissions use case", () => {
  let store: InMemoryFormStore;
  let getSubmissions: GetSubmissions;

  beforeEach(() => {
    store = new InMemoryFormStore();
    getSubmissions = new GetSubmissions(store);
  });

  it("returns submissions for an existing form", async () => {
    const form = createTestForm({ id: "form-1" });
    await store.saveForm(form);
    await store.saveSubmission("form-1", { username: "john" });

    const result = await getSubmissions.execute({ formId: "form-1" });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().submissions).toHaveLength(1);
    expect(result.unwrap().total).toBe(1);
  });

  it("fails when form does not exist", async () => {
    const result = await getSubmissions.execute({ formId: "nonexistent" });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormNotFound);
  });
});
