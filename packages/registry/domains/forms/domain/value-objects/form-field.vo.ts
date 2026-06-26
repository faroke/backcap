import { Result } from "../../shared/result.js";
import { InvalidFormField } from "../errors/invalid-form-field.error.js";

export type FormFieldType = "text" | "email" | "number" | "boolean" | "select";

export class FormField {
  private readonly _name: string;
  private readonly _type: FormFieldType;
  private readonly _required: boolean;
  private readonly _options: string[] | undefined;

  private constructor(
    name: string,
    type: FormFieldType,
    required: boolean,
    options: string[] | undefined,
  ) {
    this._name = name;
    this._type = type;
    this._required = required;
    this._options = options;
  }

  get name(): string {
    return this._name;
  }
  get type(): FormFieldType {
    return this._type;
  }
  get required(): boolean {
    return this._required;
  }
  get options(): string[] | undefined {
    return this._options;
  }

  static create(params: {
    name: string;
    type: FormFieldType;
    required: boolean;
    options?: string[] | undefined;
  }): Result<FormField, InvalidFormField> {
    if (!params.name || params.name.trim().length === 0) {
      return Result.fail(InvalidFormField.emptyName());
    }

    if (params.type === "select") {
      if (!params.options || params.options.length === 0) {
        return Result.fail(InvalidFormField.missingOptions(params.name));
      }
    }

    return Result.ok(
      new FormField(params.name, params.type, params.required, params.options),
    );
  }
}
