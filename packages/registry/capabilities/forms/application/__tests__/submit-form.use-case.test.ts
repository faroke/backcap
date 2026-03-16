import { describe, it, expect, beforeEach } from "vitest";
import { SubmitForm } from "../use-cases/submit-form.use-case.js";
import { InMemoryFormStore } from "./mocks/in-memory-form-store.mock.js";
import { createTestForm, createTestFormField } from "./fixtures/form.fixture.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import { FormValidationFailed } from "../../domain/errors/form-validation-failed.error.js";

describe("SubmitForm use case", () => {
  let store: InMemoryFormStore;
  let submitForm: SubmitForm;

  beforeEach(() => {
    store = new InMemoryFormStore();
    submitForm = new SubmitForm(store);
  });

  it("submits a valid form successfully", async () => {
    const form = createTestForm();
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: form.id,
      data: { username: "john" },
    });

    expect(result.isOk()).toBe(true);
    const output = result.unwrap();
    expect(output.submissionId).toBeDefined();
    expect(output.event.formId).toBe(form.id);
    expect(output.event.submissionId).toBe(output.submissionId);

    // Verify submission was stored
    const submissions = await store.getSubmissions(form.id);
    expect(submissions).toHaveLength(1);
    expect(submissions[0].data).toEqual({ username: "john" });
  });

  it("fails when form not found", async () => {
    const result = await submitForm.execute({
      formId: "nonexistent",
      data: { username: "john" },
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormNotFound);
  });

  it("fails when required field is missing", async () => {
    const form = createTestForm({
      fields: [createTestFormField({ name: "email", type: "email", required: true })],
    });
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: form.id,
      data: {},
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("fails when select field has invalid option", async () => {
    const form = createTestForm({
      fields: [
        createTestFormField({
          name: "color",
          type: "select",
          required: false,
          options: ["red", "blue"],
        }),
      ],
    });
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: form.id,
      data: { color: "green" },
    });

    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("accepts submission with optional fields missing", async () => {
    const form = createTestForm({
      fields: [createTestFormField({ name: "notes", required: false })],
    });
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: form.id,
      data: {},
    });

    expect(result.isOk()).toBe(true);
  });
});
