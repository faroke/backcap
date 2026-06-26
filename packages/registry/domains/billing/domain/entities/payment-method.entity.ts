import { Result } from "../../shared/result.js";
import { InvalidPaymentMethod } from "../errors/invalid-payment-method.error.js";

export type PaymentMethodType = "card" | "bank_account" | "paypal";

export class PaymentMethod {
  readonly id: string;
  readonly customerId: string;
  readonly type: PaymentMethodType;
  readonly last4: string;
  readonly expiryMonth: number | undefined;
  readonly expiryYear: number | undefined;
  readonly isDefault: boolean;
  readonly externalId: string | undefined;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    customerId: string;
    type: PaymentMethodType;
    last4: string;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
    isDefault: boolean;
    externalId?: string | undefined;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.customerId = params.customerId;
    this.type = params.type;
    this.last4 = params.last4;
    this.expiryMonth = params.expiryMonth;
    this.expiryYear = params.expiryYear;
    this.isDefault = params.isDefault;
    this.externalId = params.externalId;
    this.createdAt = params.createdAt;
  }

  static create(params: {
    id: string;
    customerId: string;
    type: PaymentMethodType;
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault?: boolean;
    externalId?: string;
    createdAt?: Date;
  }): Result<PaymentMethod, InvalidPaymentMethod> {
    if (!params.last4 || params.last4.length !== 4 || !/^\d{4}$/.test(params.last4)) {
      return Result.fail(InvalidPaymentMethod.invalidLast4());
    }
    if (params.expiryMonth !== undefined && (params.expiryMonth < 1 || params.expiryMonth > 12)) {
      return Result.fail(InvalidPaymentMethod.invalidExpiryMonth());
    }
    if (params.expiryYear !== undefined && (params.expiryYear < 2000 || params.expiryYear > 2100)) {
      return Result.fail(InvalidPaymentMethod.invalidExpiryYear());
    }
    return Result.ok(
      new PaymentMethod({
        id: params.id,
        customerId: params.customerId,
        type: params.type,
        last4: params.last4,
        expiryMonth: params.expiryMonth,
        expiryYear: params.expiryYear,
        isDefault: params.isDefault ?? false,
        externalId: params.externalId,
        createdAt: params.createdAt ?? new Date(),
      }),
    );
  }

  setAsDefault(): PaymentMethod {
    return new PaymentMethod({
      id: this.id,
      customerId: this.customerId,
      type: this.type,
      last4: this.last4,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      isDefault: true,
      externalId: this.externalId,
      createdAt: this.createdAt,
    });
  }
}
