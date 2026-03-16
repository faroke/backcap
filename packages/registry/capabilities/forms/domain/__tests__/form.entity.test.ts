import { describe, it, expect } from "vitest";
import { Form } from "../entities/form.entity.js";
import { FormField } from "../value-objects/form-field.vo.js";
import { FormValidationFailed } from "../errors/form-validation-failed.error.js";

describe("Form entity", () => {
  const createField = (name = "username") =>
    FormField.create({ name, type: "text", required: true }).unwrap();

  it("creates a valid form", () => {
    const field = createField();
    const result = Form.create({ id: "form-1", name: "Sign Up", fields: [field] });
    expect(result.isOk()).toBe(true);
    const form = result.unwrap();
    expect(form.id).toBe("form-1");
    expect(form.name).toBe("Sign Up");
    expect(form.fields).toHaveLength(1);
    expect(form.createdAt).toBeInstanceOf(Date);
  });

  it("rejects form with no fields", () => {
    const result = Form.create({ id: "form-1", name: "Empty Form", fields: [] });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("rejects form with empty name", () => {
    const field = createField();
    const result = Form.create({ id: "form-1", name: "", fields: [field] });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("addField returns new form with additional field", () => {
    const field1 = createField("username");
    const form = Form.create({ id: "form-1", name: "Test", fields: [field1] }).unwrap();
    const field2 = createField("email");
    const result = form.addField(field2);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().fields).toHaveLength(2);
    // Original unchanged
    expect(form.fields).toHaveLength(1);
  });

  it("trims form name", () => {
    const field = createField();
    const result = Form.create({ id: "form-1", name: "  Test Form  ", fields: [field] });
    expect(result.unwrap().name).toBe("Test Form");
  });
});
