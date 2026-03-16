// Template: import { Result } from "{{shared_path}}/result";
import { Result } from "../../shared/result.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import type { IFormStore, FormSubmission } from "../ports/form-store.port.js";
import type { GetSubmissionsInput } from "../dto/get-submissions.dto.js";

export class GetSubmissions {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: GetSubmissionsInput,
  ): Promise<Result<FormSubmission[], Error>> {
    const form = await this.formStore.findFormById(input.formId);
    if (!form) {
      return Result.fail(FormNotFound.create(input.formId));
    }

    const submissions = await this.formStore.getSubmissions(input.formId);
    return Result.ok(submissions);
  }
}
