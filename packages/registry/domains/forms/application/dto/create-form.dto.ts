import type { FormFieldType } from "../../domain/value-objects/form-field.vo.js";

export interface CreateFormInput {
  name: string;
  fields: Array<{
    name: string;
    type: FormFieldType;
    required: boolean;
    options?: string[];
  }>;
}

export interface CreateFormOutput {
  formId: string;
  createdAt: Date;
}
