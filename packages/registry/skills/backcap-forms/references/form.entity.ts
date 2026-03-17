import { Result } from "../../shared/result.js";
import { FormField } from "../value-objects/form-field.vo.js";

export class Form {
  readonly id: string;
  readonly name: string;
  readonly fields: FormField[];
  readonly createdAt: Date;

  private constructor(
    id: string,
    name: string,
    fields: FormField[],
    createdAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.fields = [...fields];
    this.createdAt = createdAt;
  }

  static create(params: {
    id: string;
    name: string;
    fields: FormField[];
    createdAt?: Date;
  }): Result<Form, Error> {
    if (params.fields.length === 0) {
      return Result.fail(new Error("A form must have at least one field"));
    }

    return Result.ok(
      new Form(params.id, params.name, params.fields, params.createdAt ?? new Date()),
    );
  }

  addField(field: FormField): Result<Form, Error> {
    const newFields = [...this.fields, field];
    return Result.ok(new Form(this.id, this.name, newFields, this.createdAt));
  }
}
