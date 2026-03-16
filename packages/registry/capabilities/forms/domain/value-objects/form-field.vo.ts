// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FormValidationFailed } from "../errors/form-validation-failed.error.js";

export type FormFieldType = "text" | "email" | "number" | "boolean" | "select";

export class FormField {
  readonly name: string;
  readonly type: FormFieldType;
  readonly required: boolean;
  readonly options: string[] | undefined;

  private constructor(
    name: string,
    type: FormFieldType,
    required: boolean,
    options: string[] | undefined,
  ) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.options = options;
  }

  static create(params: {
    name: string;
    type: FormFieldType;
    required: boolean;
    options?: string[];
  }): Result<FormField, FormValidationFailed> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(FormValidationFailed.create("Field name cannot be empty"));
    }

    if (params.type === "select") {
      if (!params.options || params.options.length === 0) {
        return Result.fail(
          FormValidationFailed.create(
            `Field "${params.name}" of type "select" must have non-empty options`,
          ),
        );
      }
    }

    return Result.ok(
      new FormField(params.name.trim(), params.type, params.required, params.options),
    );
  }
}
