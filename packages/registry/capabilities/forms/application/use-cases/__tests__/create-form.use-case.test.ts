import { describe, it, expect, beforeEach } from "vitest";
import { CreateForm } from "../create-form.use-case.js";
import { InMemoryFormStore } from "./mocks/in-memory-form-store.mock.js";

describe("CreateForm use case", () => {
  let store: InMemoryFormStore;
  let createForm: CreateForm;

  beforeEach(() => {
    store = new InMemoryFormStore();
    createForm = new CreateForm(store);
  });

  it("creates a form successfully", async () => {
    const result = await createForm.execute({
      name: "Contact",
      fields: [{ name: "email", type: "email", required: true }],
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.formId).toBeDefined();
    expect(output.createdAt).toBeInstanceOf(Date);
  });

  it("fails when fields array is empty", async () => {
    const result = await createForm.execute({ name: "Empty", fields: [] });
    expect(result.isFail()).toBe(true);
  });

  it("fails when a select field has no options", async () => {
    const result = await createForm.execute({
      name: "Bad Form",
      fields: [{ name: "color", type: "select", required: true }],
    });
    expect(result.isFail()).toBe(true);
  });
});
