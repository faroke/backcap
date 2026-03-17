import { Result } from "../../shared/result.js";
import { Form } from "../../domain/entities/form.entity.js";
import { FormField } from "../../domain/value-objects/form-field.vo.js";
import type { IFormStore } from "../ports/form-store.port.js";
import type { CreateFormInput, CreateFormOutput } from "../dto/create-form.dto.js";

export class CreateForm {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: CreateFormInput,
  ): Promise<Result<CreateFormOutput, Error>> {
    const fields: FormField[] = [];
    for (const f of input.fields) {
      const fieldResult = FormField.create({
        name: f.name,
        type: f.type,
        required: f.required,
        options: f.options,
      });
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

    const form = formResult.unwrap();
    await this.formStore.saveForm(form);

    return Result.ok({ formId: form.id, createdAt: form.createdAt });
  }
}
