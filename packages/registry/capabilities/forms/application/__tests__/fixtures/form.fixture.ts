import { Form } from "../../../domain/entities/form.entity.js";
import { FormField } from "../../../domain/value-objects/form-field.vo.js";

export function createTestForm(
  overrides?: Partial<{ id: string; name: string }>,
): Form {
  const field = FormField.create({ name: "username", type: "text", required: true }).unwrap();
  const result = Form.create({
    id: overrides?.id ?? "test-form-1",
    name: overrides?.name ?? "Test Form",
    fields: [field],
  });

  if (result.isFail()) {
    throw new Error(`Failed to create test form: ${result.unwrapError().message}`);
  }
  return result.unwrap();
}
