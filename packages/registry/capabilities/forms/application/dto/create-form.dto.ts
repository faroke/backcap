import type { FormFieldType } from "../../domain/value-objects/form-field.vo.js";

export interface CreateFormFieldInput {
  name: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface CreateFormInput {
  name: string;
  fields: CreateFormFieldInput[];
}
