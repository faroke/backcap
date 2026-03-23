import type { Result } from "../shared/result.js";

export interface CreateCustomerInput {
  id: string;
  email: string;
  name: string;
}

export interface CreateCustomerOutput {
  customerId: string;
}

export interface ICreateCustomer {
  execute(input: CreateCustomerInput): Promise<Result<CreateCustomerOutput, Error>>;
}
