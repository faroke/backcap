import { Result } from "../../shared/result.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import { InvalidRefund } from "../../domain/errors/invalid-refund.error.js";
import { ProviderError } from "../../domain/errors/provider.error.js";
import type { MoneyError } from "../../domain/errors/money.error.js";
import type { IPaymentProvider } from "../ports/payment-provider.port.js";
import type { RefundPaymentInput } from "../dto/refund-payment-input.dto.js";

export class RefundPayment {
  constructor(
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: RefundPaymentInput,
  ): Promise<
    Result<{ refundId: string }, InvalidRefund | MoneyError | ProviderError>
  > {
    const hasAmount = input.amount !== undefined;
    const hasCurrency = input.currency !== undefined;
    if (hasAmount !== hasCurrency) {
      return Result.fail(InvalidRefund.missingAmountOrCurrency());
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
      return Result.fail(ProviderError.create(reason));
    }
  }
}
