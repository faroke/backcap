import { Result } from "../../shared/result.js";
import { Money } from "../value-objects/money.vo.js";

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export class Invoice {
  readonly id: string;
  readonly customerId: string;
  readonly subscriptionId: string | undefined;
  readonly amount: Money;
  readonly status: InvoiceStatus;
  readonly dueDate: Date;
  readonly paidAt: Date | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(params: {
    id: string;
    customerId: string;
    subscriptionId?: string;
    amount: Money;
    status: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.customerId = params.customerId;
    this.subscriptionId = params.subscriptionId;
    this.amount = params.amount;
    this.status = params.status;
    this.dueDate = params.dueDate;
    this.paidAt = params.paidAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  private static readonly VALID_STATUSES: InvoiceStatus[] = ["draft", "open", "paid", "void", "uncollectible"];

  static create(params: {
    id: string;
    customerId: string;
    subscriptionId?: string;
    amountValue: number;
    amountCurrency: string;
    status: string;
    dueDate: Date;
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): Result<Invoice, Error> {
    if (!Invoice.VALID_STATUSES.includes(params.status as InvoiceStatus)) {
      return Result.fail(new Error(`Invalid invoice status: "${params.status}"`));
    }
    const amountResult = Money.create(params.amountValue, params.amountCurrency);
    if (amountResult.isFail()) return Result.fail(amountResult.unwrapError());

    const now = new Date();
    return Result.ok(
      new Invoice({
        id: params.id,
        customerId: params.customerId,
        subscriptionId: params.subscriptionId,
        amount: amountResult.unwrap(),
        status: params.status as InvoiceStatus,
        dueDate: params.dueDate,
        paidAt: params.paidAt,
        createdAt: params.createdAt ?? now,
        updatedAt: params.updatedAt ?? now,
      }),
    );
  }

  markPaid(): Result<Invoice, Error> {
    if (this.status !== "open" && this.status !== "draft") {
      return Result.fail(new Error(`Cannot mark invoice as paid from status "${this.status}"`));
    }
    return Result.ok(
      new Invoice({
        id: this.id,
        customerId: this.customerId,
        subscriptionId: this.subscriptionId,
        amount: this.amount,
        status: "paid",
        dueDate: this.dueDate,
        paidAt: new Date(),
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }),
    );
  }
}
