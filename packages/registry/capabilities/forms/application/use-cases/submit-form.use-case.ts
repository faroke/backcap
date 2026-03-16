// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FormSubmitted } from "../../domain/events/form-submitted.event.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import { FormValidationFailed } from "../../domain/errors/form-validation-failed.error.js";
import type { IFormStore } from "../ports/form-store.port.js";
import type { SubmitFormInput } from "../dto/submit-form.dto.js";

export class SubmitForm {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: SubmitFormInput,
  ): Promise<Result<{ submissionId: string; event: FormSubmitted }, Error>> {
    const form = await this.formStore.findFormById(input.formId);
    if (!form) {
      return Result.fail(FormNotFound.create(input.formId));
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required) {
        const value = input.data[field.name];
        if (value === undefined || value === null || value === "") {
          return Result.fail(
            FormValidationFailed.create(`Required field "${field.name}" is missing`),
          );
        }
      }
    }

    // Validate select fields have valid options
    for (const field of form.fields) {
      if (field.type === "select" && input.data[field.name] !== undefined) {
        const value = input.data[field.name];
        if (field.options && !field.options.includes(String(value))) {
          return Result.fail(
            FormValidationFailed.create(
              `Field "${field.name}" has invalid option: "${value}"`,
            ),
          );
        }
      }
    }

    const submissionId = crypto.randomUUID();
    await this.formStore.saveSubmission({
      id: submissionId,
      formId: input.formId,
      data: input.data,
      submittedAt: new Date(),
    });

    const event = new FormSubmitted(input.formId, submissionId);
    return Result.ok({ submissionId, event });
  }
}
