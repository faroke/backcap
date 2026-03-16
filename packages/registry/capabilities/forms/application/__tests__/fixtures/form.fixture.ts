import { Form } from "../../../domain/entities/form.entity.js";
import { FormField } from "../../../domain/value-objects/form-field.vo.js";

export function createTestFormField(
  overrides?: Partial<{
    name: string;
    type: "text" | "email" | "number" | "boolean" | "select";
    required: boolean;
    options: string[];
  }>,
): FormField {
  const result = FormField.create({
    name: overrides?.name ?? "username",
    type: overrides?.type ?? "text",
    required: overrides?.required ?? true,
    options: overrides?.options,
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test form field: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}

export function createTestForm(
  overrides?: Partial<{
    id: string;
    name: string;
    fields: FormField[];
  }>,
): Form {
  const result = Form.create({
    id: overrides?.id ?? "test-form-1",
    name: overrides?.name ?? "Test Form",
    fields: overrides?.fields ?? [createTestFormField()],
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test form: ${result.unwrapError().message}`);
  }

  return result.unwrap();
}
