import { Result } from "../../shared/result.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import { FormValidationFailed } from "../../domain/errors/form-validation-failed.error.js";
import { FormSubmitted } from "../../domain/events/form-submitted.event.js";
import type { IFormStore } from "../ports/form-store.port.js";
import type { SubmitFormInput, SubmitFormOutput } from "../dto/submit-form.dto.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SubmitForm {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: SubmitFormInput,
  ): Promise<Result<{ output: SubmitFormOutput; event: FormSubmitted }, FormNotFound | FormValidationFailed>> {
    const form = await this.formStore.findFormById(input.formId);
    if (!form) {
      return Result.fail(FormNotFound.create(input.formId));
    }

    for (const field of form.fields) {
      const value = input.data[field.name];

      if (field.required && (value === undefined || value === null || value === "")) {
        return Result.fail(
          FormValidationFailed.create(`Required field "${field.name}" is missing`),
        );
      }

      if (value !== undefined && value !== null && value !== "") {
        switch (field.type) {
          case "email":
            if (typeof value !== "string" || !EMAIL_REGEX.test(value)) {
              return Result.fail(
                FormValidationFailed.create(`Field "${field.name}" must be a valid email`),
              );
            }
            break;
          case "number":
            if (typeof value !== "number" || !Number.isFinite(value)) {
              return Result.fail(
                FormValidationFailed.create(`Field "${field.name}" must be a finite number`),
              );
            }
            break;
          case "boolean":
            if (typeof value !== "boolean") {
              return Result.fail(
                FormValidationFailed.create(`Field "${field.name}" must be a boolean`),
              );
            }
            break;
          case "select":
            if (typeof value !== "string" || !field.options?.includes(value)) {
              return Result.fail(
                FormValidationFailed.create(
                  `Field "${field.name}" must be one of: ${field.options?.join(", ")}`,
                ),
              );
            }
            break;
        }
      }
    }

    const { submissionId } = await this.formStore.saveSubmission(input.formId, input.data);
    const submittedAt = new Date();
    const event = new FormSubmitted(input.formId, submissionId);

    return Result.ok({
      output: { submissionId, submittedAt },
      event,
    });
  }
}
