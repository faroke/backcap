// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FormField } from "../value-objects/form-field.vo.js";
import { FormValidationFailed } from "../errors/form-validation-failed.error.js";

export class Form {
  readonly id: string;
  readonly name: string;
  readonly fields: readonly FormField[];
  readonly createdAt: Date;

  private constructor(
    id: string,
    name: string,
    fields: FormField[],
    createdAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.fields = fields;
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    name: string;
    fields: FormField[];
    createdAt?: Date;
  }): Result<Form, FormValidationFailed> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(FormValidationFailed.create("Form name cannot be empty"));
    }

    if (!params.fields || params.fields.length === 0) {
      return Result.fail(FormValidationFailed.create("Form must have at least one field"));
    }

    return Result.ok(
      new Form(
        params.id,
        params.name.trim(),
        [...params.fields],
        params.createdAt ?? new Date(),
      ),
    );
  }

  addField(field: FormField): Result<Form, FormValidationFailed> {
    return Result.ok(
      new Form(this.id, this.name, [...this.fields, field], this.createdAt),
    );
  }
}
