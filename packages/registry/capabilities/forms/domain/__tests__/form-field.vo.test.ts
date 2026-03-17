import { describe, it, expect } from "vitest";
import { FormField } from "../value-objects/form-field.vo.js";

describe("FormField VO", () => {
  it("creates a text field", () => {
    const result = FormField.create({ name: "username", type: "text", required: true });
    expect(result.isOk()).toBe(true);
    const field = result.unwrap();
    expect(field.name).toBe("username");
    expect(field.type).toBe("text");
    expect(field.required).toBe(true);
    expect(field.options).toBeUndefined();
  });

  it("creates a select field with options", () => {
    const result = FormField.create({
      name: "color",
      type: "select",
      required: true,
      options: ["red", "blue", "green"],
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrap().options).toEqual(["red", "blue", "green"]);
  });

  it("fails when select field has no options", () => {
    const result = FormField.create({ name: "color", type: "select", required: true });
    expect(result.isFail()).toBe(true);
  });

  it("fails when select field has empty options array", () => {
    const result = FormField.create({
      name: "color",
      type: "select",
      required: true,
      options: [],
    });
    expect(result.isFail()).toBe(true);
  });

  it("fails when field name is empty", () => {
    const result = FormField.create({ name: "", type: "text", required: false });
    expect(result.isFail()).toBe(true);
  });

  it("creates email, number, boolean fields", () => {
    expect(FormField.create({ name: "e", type: "email", required: true }).isOk()).toBe(true);
    expect(FormField.create({ name: "n", type: "number", required: false }).isOk()).toBe(true);
    expect(FormField.create({ name: "b", type: "boolean", required: false }).isOk()).toBe(true);
  });
});
