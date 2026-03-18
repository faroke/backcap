import { Result } from "../../shared/result.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import { PaymentSucceeded } from "../../domain/events/payment-succeeded.event.js";
import { CustomerNotFound } from "../../domain/errors/customer-not-found.error.js";
import { PaymentDeclined } from "../../domain/errors/payment-declined.error.js";
import type { ICustomerRepository } from "../ports/customer-repository.port.js";
import type { IPaymentProvider } from "../ports/payment-provider.port.js";
import type { ProcessPaymentInput } from "../dto/process-payment-input.dto.js";

export class ProcessPayment {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: ProcessPaymentInput,
  ): Promise<Result<{ transactionId: string; event: PaymentSucceeded }, Error>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      return Result.fail(CustomerNotFound.create(input.customerId));
    }

    const amountResult = Money.create(input.amount, input.currency);
    if (amountResult.isFail()) {
      return Result.fail(amountResult.unwrapError());
    }

    const amount = amountResult.unwrap();

    try {
      const { transactionId } = await this.paymentProvider.charge(
        customer.externalId ?? customer.id,
        amount,
        input.description,
      );
      const event = new PaymentSucceeded(input.customerId, input.amount, input.currency);
      return Result.ok({ transactionId, event });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown error";
      return Result.fail(PaymentDeclined.create(reason));
    }
  }
}
