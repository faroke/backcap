// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { Form } from "../../domain/entities/form.entity.js";
import { FormField } from "../../domain/value-objects/form-field.vo.js";
import type { IFormStore } from "../ports/form-store.port.js";
import type { CreateFormInput } from "../dto/create-form.dto.js";

export class CreateForm {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: CreateFormInput,
  ): Promise<Result<{ formId: string }, Error>> {
    const fields: FormField[] = [];
    for (const fieldInput of input.fields) {
      const fieldResult = FormField.create(fieldInput);
      if (fieldResult.isFail()) {
        return Result.fail(fieldResult.unwrapError());
      }
      fields.push(fieldResult.unwrap());
    }

    const id = crypto.randomUUID();
    const formResult = Form.create({ id, name: input.name, fields });
    if (formResult.isFail()) {
      return Result.fail(formResult.unwrapError());
    }

    await this.formStore.saveForm(formResult.unwrap());
    return Result.ok({ formId: id });
  }
}
