import { Result } from "../../shared/result.js";
import { FormNotFound } from "../../domain/errors/form-not-found.error.js";
import type { IFormStore } from "../ports/form-store.port.js";
import type { GetSubmissionsInput, GetSubmissionsOutput } from "../dto/get-submissions.dto.js";

export class GetSubmissions {
  constructor(private readonly formStore: IFormStore) {}

  async execute(
    input: GetSubmissionsInput,
  ): Promise<Result<GetSubmissionsOutput, FormNotFound>> {
    const form = await this.formStore.findFormById(input.formId);
    if (!form) {
      return Result.fail(FormNotFound.create(input.formId));
    }

    const { submissions, total } = await this.formStore.getSubmissions(
      input.formId,
      { limit: input.limit ?? 50, offset: input.offset ?? 0 },
    );

    return Result.ok({ submissions, total });
  }
}
