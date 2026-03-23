import { describe, it, expect, beforeEach } from "vitest";
import { SubmitForm } from "../use-cases/submit-form.use-case.js";
import { InMemoryFormStore } from "./mocks/in-memory-form-store.mock.js";
import { createTestForm } from "./fixtures/form.fixture.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import { FormValidationFailed } from "../../domain/errors/form-validation-failed.error.js";
import { Form } from "../../domain/entities/form.entity.js";
import { FormField } from "../../domain/value-objects/form-field.vo.js";

describe("SubmitForm use case", () => {
  let store: InMemoryFormStore;
  let submitForm: SubmitForm;

  beforeEach(() => {
    store = new InMemoryFormStore();
    submitForm = new SubmitForm(store);
  });

  it("submits a form successfully", async () => {
    const form = createTestForm({ id: "form-1" });
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: "form-1",
      data: { username: "john" },
    });

    expect(result.isOk()).toBe(true);
    const { output, event } = result.unwrap();
    expect(output.submissionId).toBeDefined();
    expect(output.submittedAt).toBeInstanceOf(Date);
    expect(event.formId).toBe("form-1");
  });

  it("fails when form does not exist", async () => {
    const result = await submitForm.execute({
      formId: "nonexistent",
      data: { username: "john" },
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormNotFound);
  });

  it("fails when required field is missing", async () => {
    const form = createTestForm({ id: "form-2" });
    await store.saveForm(form);

    const result = await submitForm.execute({
      formId: "form-2",
      data: {},
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("validates email fields", async () => {
    const emailField = FormField.create({ name: "email", type: "email", required: true }).unwrap();
    const form = Form.create({ id: "form-email", name: "Email Form", fields: [emailField] }).unwrap();
    await store.saveForm(form);

    const bad = await submitForm.execute({ formId: "form-email", data: { email: "not-an-email" } });
    expect(bad.isFail()).toBe(true);
    expect(bad.unwrapError()).toBeInstanceOf(FormValidationFailed);

    const good = await submitForm.execute({ formId: "form-email", data: { email: "test@example.com" } });
    expect(good.isOk()).toBe(true);
  });

  it("validates number fields", async () => {
    const numField = FormField.create({ name: "age", type: "number", required: true }).unwrap();
    const form = Form.create({ id: "form-num", name: "Num Form", fields: [numField] }).unwrap();
    await store.saveForm(form);

    const bad = await submitForm.execute({ formId: "form-num", data: { age: "not-a-number" } });
    expect(bad.isFail()).toBe(true);

    const good = await submitForm.execute({ formId: "form-num", data: { age: 25 } });
    expect(good.isOk()).toBe(true);
  });

  it("validates select fields against options", async () => {
    const selectField = FormField.create({
      name: "color",
      type: "select",
      required: true,
      options: ["red", "blue"],
    }).unwrap();
    const form = Form.create({ id: "form-sel", name: "Select Form", fields: [selectField] }).unwrap();
    await store.saveForm(form);

    const bad = await submitForm.execute({ formId: "form-sel", data: { color: "green" } });
    expect(bad.isFail()).toBe(true);

    const good = await submitForm.execute({ formId: "form-sel", data: { color: "red" } });
    expect(good.isOk()).toBe(true);
  });
});
