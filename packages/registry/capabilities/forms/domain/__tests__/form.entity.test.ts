import { describe, it, expect } from "vitest";
import { Form } from "../entities/form.entity.js";
import { FormField } from "../value-objects/form-field.vo.js";

describe("Form entity", () => {
  const textField = FormField.create({ name: "username", type: "text", required: true }).unwrap();

  it("creates a form with fields", () => {
    const result = Form.create({ id: "form-1", name: "Contact", fields: [textField] });
    expect(result.isOk()).toBe(true);
    const form = result.unwrap();
    expect(form.id).toBe("form-1");
    expect(form.name).toBe("Contact");
    expect(form.fields).toHaveLength(1);
    expect(form.createdAt).toBeInstanceOf(Date);
  });

  it("fails when no fields are provided", () => {
    const result = Form.create({ id: "form-1", name: "Empty", fields: [] });
    expect(result.isFail()).toBe(true);
  });

  it("adds a field to an existing form", () => {
    const form = Form.create({ id: "form-1", name: "Contact", fields: [textField] }).unwrap();
    const emailField = FormField.create({ name: "email", type: "email", required: true }).unwrap();
    const result = form.addField(emailField);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().fields).toHaveLength(2);
    // Original form is unchanged (immutability)
    expect(form.fields).toHaveLength(1);
  });
});
