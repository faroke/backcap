import { describe, it, expect } from "vitest";
import { FormField } from "../value-objects/form-field.vo.js";
import { FormValidationFailed } from "../errors/form-validation-failed.error.js";

describe("FormField VO", () => {
  it("creates a valid text field", () => {
    const result = FormField.create({ name: "username", type: "text", required: true });
    expect(result.isOk()).toBe(true);
    const field = result.unwrap();
    expect(field.name).toBe("username");
    expect(field.type).toBe("text");
    expect(field.required).toBe(true);
    expect(field.options).toBeUndefined();
  });

  it("creates a valid select field with options", () => {
    const result = FormField.create({
      name: "color",
      type: "select",
      required: false,
      options: ["red", "blue", "green"],
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().options).toEqual(["red", "blue", "green"]);
  });

  it("rejects select field without options", () => {
    const result = FormField.create({ name: "color", type: "select", required: false });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("rejects select field with empty options", () => {
    const result = FormField.create({
      name: "color",
      type: "select",
      required: false,
      options: [],
    });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("rejects empty field name", () => {
    const result = FormField.create({ name: "", type: "text", required: true });
    expect(result.isFail()).toBe(true);
    expect(result.unwrapError()).toBeInstanceOf(FormValidationFailed);
  });

  it("trims field name", () => {
    const result = FormField.create({ name: "  username  ", type: "text", required: true });
    expect(result.unwrap().name).toBe("username");
  });

  it("creates email, number, boolean fields", () => {
    for (const type of ["email", "number", "boolean"] as const) {
      const result = FormField.create({ name: "field", type, required: false });
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().type).toBe(type);
    }
  });
});
