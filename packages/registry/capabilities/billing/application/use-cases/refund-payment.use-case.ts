import { Result } from "../../shared/result.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import type { IPaymentProvider } from "../ports/payment-provider.port.js";
import type { RefundPaymentInput } from "../dto/refund-payment-input.dto.js";

export class RefundPayment {
  constructor(
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: RefundPaymentInput,
  ): Promise<Result<{ refundId: string }, Error>> {
    const hasAmount = input.amount !== undefined;
    const hasCurrency = input.currency !== undefined;
    if (hasAmount !== hasCurrency) {
      return Result.fail(new Error("Both amount and currency are required for partial refund"));
    }

    let amount: Money | undefined;
    if (hasAmount && hasCurrency) {
      const amountResult = Money.create(input.amount!, input.currency!);
      if (amountResult.isFail()) {
        return Result.fail(amountResult.unwrapError());
      }
      amount = amountResult.unwrap();
    }

    try {
      const { refundId } = await this.paymentProvider.refund(input.transactionId, amount);
      return Result.ok({ refundId });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Refund failed";
      return Result.fail(new Error(reason));
    }
  }
}
